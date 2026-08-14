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

const LIQUID_WAVE_FRAGMENT_SHADER = /* glsl */ `
  precision highp float;
  uniform sampler2D uTexture;
  uniform float uProgress;
  uniform vec2 uResolution;
  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;

    // Liquid Ripple Distortion Peak at mid-transition (sin curve 0 -> 1 -> 0)
    float waveAmp = sin(uProgress * 3.14159265);
    
    // Multi-frequency wave formula
    float waveX = sin(uv.y * 15.0 + uProgress * 8.0) * 0.04 * waveAmp;
    float waveY = cos(uv.x * 15.0 + uProgress * 8.0) * 0.04 * waveAmp;

    vec2 distortedUv = clamp(uv + vec2(waveX, waveY), 0.0, 1.0);

    // RGB Chromatic Aberration Split
    float shift = 0.025 * waveAmp;
    float r = texture2D(uTexture, distortedUv + vec2(shift, 0.0)).r;
    float g = texture2D(uTexture, distortedUv).g;
    float b = texture2D(uTexture, distortedUv - vec2(shift, 0.0)).b;

    // Directional Wipe Mask
    float wipe = step(uv.y, uProgress * 1.2);
    float alpha = wipe * clamp(waveAmp * 1.5 + 0.2, 0.0, 1.0);

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
        fragment: LIQUID_WAVE_FRAGMENT_SHADER,
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
      console.warn("WebGL initialization skipped:", e);
    }
  }, []);

  const startTransition = useCallback(
    (href: string, coverImageUrl?: string) => {
      if (transitioningRef.current) return;
      transitioningRef.current = true;

      if (!oglRef.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        router.push(href);
        transitioningRef.current = false;
        return;
      }

      const { renderer, program, mesh, texture } = oglRef.current;

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
          duration: 0.95,
          ease: "power3.inOut",
          onUpdate: () => {
            program.uniforms.uProgress.value = state.progress;
            renderer.render({ scene: mesh });
          },
          onComplete: () => {
            router.push(href);

            gsap.to(containerRef.current, {
              opacity: 0,
              duration: 0.35,
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
