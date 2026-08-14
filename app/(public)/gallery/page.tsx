export const dynamic = "force-dynamic";

import React from "react";
import { Metadata } from "next";
import ProjectGallery from "@/components/project-gallery/project-gallery";
import SmoothScrollProvider from "@/components/shared/smooth-scroll-provider";
import TransitionCanvasProvider from "@/components/transition-canvas/transition-canvas";

export const metadata: Metadata = {
  title: "Visual Gallery Showcase | TEMP TRAVEL CAR RENTALS",
  description: "Experience our luxury fleet and curated travel expeditions in an interactive Jesper Landberg style project gallery.",
};

export default function GalleryPage() {
  return (
    <SmoothScrollProvider>
      <TransitionCanvasProvider>
        <main className="bg-slate-950 min-h-screen text-slate-100 selection:bg-yellow-400 selection:text-slate-950">
          <ProjectGallery />
        </main>
      </TransitionCanvasProvider>
    </SmoothScrollProvider>
  );
}
