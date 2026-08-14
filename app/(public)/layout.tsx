"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Header from "@/components/shared/header";
import Footer from "@/components/shared/footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isGallery = pathname === "/gallery";

  return (
    <div className={`flex flex-col bg-slate-950 text-slate-100 ${isGallery ? "h-screen overflow-hidden" : "min-h-screen"}`}>
      <Header />
      <main className={`flex-grow ${isGallery ? "h-[calc(100vh-80px)] overflow-hidden" : ""}`}>
        {children}
      </main>
      {!isGallery && <Footer />}
    </div>
  );
}
