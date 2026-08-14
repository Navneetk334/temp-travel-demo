import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export const EASES = {
  out: "power3.out",
  inOut: "power3.inOut",
  expoOut: "expo.out",
  overshoot: "back.out(1.2)",
  snap: "power2.in",
};

export { gsap, ScrollTrigger };
