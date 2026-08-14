"use client";

import React, { useEffect, useRef, createContext, useContext, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Renderer, Program, Mesh, Triangle, Texture } from "ogl";
import { gsap } from "@/lib/gsap";

interface TransitionContextType {
  startTransition: (href: string, coverImageUrl?: string) => void;
  isTransitioning: boolean;
}

const TransitionContext = createContext<TransitionContextType>({
  startTransition: () => {},
  isTransitioning: false,
});

export const usePageTransition = () => useContext(TransitionContext);

const VERTEX_SHADER = /* glsl */ `
  attribute vec2 position;
  attribute vec2 uv;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  precision highp float;
  uniform sampler2D uTexture;
  uniform float uProgress;
  uniform vec2 uResolution;
  varying vec2 vUv;

  // Simple pseudo random
  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
  }

  void main() {
    vec2 uv = vUv;

    // 1. Grid Tile Snap Stagger
    vec2 grid = vec2(12.0, 8.0);
    vec2 cell = floor(uv * grid);
    float cellNoise = random(cell);

    // Stagger progress across cells
    float tileThreshold = clamp((uProgress * 1.4) - (cellNoise * 0.4), 0.0, 1.0);

    if (tileThreshold <= 0.001) {
      discard;
    }

    // 2. Mid-transition Warp Noise Peak
    float warpIntensity = sin(uProgress * 3.14159265);
    vec2 offset = vec2(
      sin(uv.y * 20.0 + uProgress * 10.0) * 0.03 * warpIntensity,
      cos(uv.x * 20.0 + uProgress * 10.0) * 0.03 * warpIntensity
    );

    vec2 distortedUv = clamp(uv + offset, 0.0, 1.0);

    // 3. Chromatic Aberration RGB Channel Split
    float shift = 0.02 * warpIntensity;
    float r = texture2D(uTexture, distortedUv + vec2(shift, 0.0)).r;
    float g = texture2D(uTexture, distortedUv).g;
    float b = texture2D(uTexture, distortedUv - vec2(shift, 0.0)).b;
    float alpha = texture2D(uTexture, distortedUv).a * tileThreshold;

    gl_FragColor = vec4(r, g, b, alpha);
  }
`;

export default function TransitionCanvasProvider({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const router = useRouter();
  const transitioningRef = useRef(false);

  const oglRef = useRef<{
    renderer: Renderer;
    program: Program;
    mesh: Mesh;
    texture: Texture;
  } | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Check reduced motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    try {
      const renderer = new Renderer({
        canvas: canvasRef.current,
        alpha: true,
        dpr: Math.min(window.devicePixelRatio, 2),
      });

      const gl = renderer.gl;
      gl.clearColor(0, 0, 0, 0);

      const geometry = new Triangle(gl);
      const texture = new Texture(gl);

      const program = new Program(gl, {
        vertex: VERTEX_SHADER,
        fragment: FRAGMENT_SHADER,
        uniforms: {
          uTexture: { value: texture },
          uProgress: { value: 0 },
          uResolution: { value: [window.innerWidth, window.innerHeight] },
        },
        transparent: true,
      });

      const mesh = new Mesh(gl, { geometry, program });

      oglRef.current = { renderer, program, mesh, texture };

      const handleResize = () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        program.uniforms.uResolution.value = [window.innerWidth, window.innerHeight];
      };

      handleResize();
      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
      };
    } catch (e) {
      console.warn("WebGL initialization failed, falling back to instant transitions:", e);
    }
  }, []);

  const startTransition = useCallback(
    (href: string, coverImageUrl?: string) => {
      if (transitioningRef.current) return;
      transitioningRef.current = true;

      // Fallback for reduced motion or WebGL failure
      if (!oglRef.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        router.push(href);
        transitioningRef.current = false;
        return;
      }

      const { renderer, program, mesh, texture } = oglRef.current;

      // Load cover image as target texture
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = coverImageUrl || "/images/fleet-suv.png";

      img.onload = () => {
        texture.image = img;
        texture.needsUpdate = true;

        if (containerRef.current) {
          containerRef.current.style.pointerEvents = "auto";
          containerRef.current.style.opacity = "1";
        }

        const state = { progress: 0 };

        gsap.to(state, {
          progress: 1,
          duration: 0.9,
          ease: "power3.inOut",
          onUpdate: () => {
            program.uniforms.uProgress.value = state.progress;
            renderer.render({ scene: mesh });
          },
          onComplete: () => {
            router.push(href);

            // Fade out canvas after routing
            gsap.to(containerRef.current, {
              opacity: 0,
              duration: 0.4,
              ease: "power2.out",
              onComplete: () => {
                program.uniforms.uProgress.value = 0;
                if (containerRef.current) {
                  containerRef.current.style.pointerEvents = "none";
                }
                transitioningRef.current = false;
              },
            });
          },
        });
      };

      img.onerror = () => {
        router.push(href);
        transitioningRef.current = false;
      };
    },
    [router]
  );

  return (
    <TransitionContext.Provider value={{ startTransition, isTransitioning: transitioningRef.current }}>
      {children}
      <div
        ref={containerRef}
        className="fixed inset-0 z-[9999] pointer-events-none opacity-0 transition-opacity duration-200"
      >
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>
    </TransitionContext.Provider>
  );
}
