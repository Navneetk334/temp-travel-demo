"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { GALLERY_PROJECTS, GalleryProject } from "@/data/projects";
import { gsap } from "@/lib/gsap";
import { usePageTransition } from "@/components/transition-canvas/transition-canvas";
import styles from "./project-gallery.module.css";
import { ArrowUpRight, Sparkles, Layers } from "lucide-react";

export default function ProjectGallery() {
  const [filter, setFilter] = useState<"featured" | "full">("featured");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [activeCover, setActiveCover] = useState<GalleryProject | null>(null);

  const previewRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const { startTransition } = usePageTransition();

  // Filtered project list
  const projects = filter === "featured"
    ? GALLERY_PROJECTS.filter((p) => p.featured)
    : GALLERY_PROJECTS;

  // Set up cursor-following GSAP quickTo
  const xTo = useRef<any>(null);
  const yTo = useRef<any>(null);

  useEffect(() => {
    if (!previewRef.current) return;

    // Check reduced motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Center cursor offset
    xTo.current = gsap.quickTo(previewRef.current, "x", { duration: 0.45, ease: "power3.out" });
    yTo.current = gsap.quickTo(previewRef.current, "y", { duration: 0.45, ease: "power3.out" });

    const handleMouseMove = (e: MouseEvent) => {
      if (xTo.current && yTo.current) {
        xTo.current(e.clientX - 140);
        yTo.current(e.clientY - 180);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // Handle Mouse Enter on Row
  const handleRowMouseEnter = (project: GalleryProject) => {
    setHoveredId(project.id);
    setActiveCover(project);

    if (previewRef.current && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.to(previewRef.current, {
        scale: 1,
        opacity: 1,
        duration: 0.4,
        ease: "back.out(1.2)",
        overwrite: "auto",
      });
    }
  };

  // Handle Mouse Leave on Row
  const handleRowMouseLeave = () => {
    setHoveredId(null);
    if (previewRef.current) {
      gsap.to(previewRef.current, {
        scale: 0.7,
        opacity: 0,
        duration: 0.3,
        ease: "power2.in",
        overwrite: "auto",
      });
    }
  };

  // Handle Filter Change with Stagger Animation
  const handleFilterChange = (newFilter: "featured" | "full") => {
    if (newFilter === filter) return;

    if (listRef.current) {
      const rows = listRef.current.children;
      gsap.to(rows, {
        opacity: 0,
        y: -10,
        stagger: 0.02,
        duration: 0.25,
        ease: "power2.in",
        onComplete: () => {
          setFilter(newFilter);
          requestAnimationFrame(() => {
            if (listRef.current) {
              const newRows = listRef.current.children;
              gsap.fromTo(
                newRows,
                { opacity: 0, y: 15 },
                {
                  opacity: 1,
                  y: 0,
                  stagger: 0.03,
                  duration: 0.4,
                  ease: "power3.out",
                }
              );
            }
          });
        },
      });
    } else {
      setFilter(newFilter);
    }
  };

  // Handle Click with WebGL Shader Transition
  const handleProjectClick = (e: React.MouseEvent, project: GalleryProject) => {
    e.preventDefault();
    const targetUrl = project.category === "fleet" ? "/fleet" : project.category === "tours" ? "/tours" : "/corporate-inquiry";
    startTransition(targetUrl, project.coverImage);
  };

  return (
    <section className={styles.galleryContainer}>
      
      {/* 1. Header Navigation & Filter Bar */}
      <div className={styles.galleryHeader}>
        <div>
          <span className={styles.brandTitle}>TEMP TRAVEL</span>
          <span className={styles.brandSub}>Jesper Landberg Visual Showcase</span>
        </div>

        {/* Featured / Full Toggle */}
        <div className={styles.filterBar}>
          <button
            onClick={() => handleFilterChange("featured")}
            className={`${styles.filterBtn} ${filter === "featured" ? styles.filterBtnActive : ""}`}
          >
            <Sparkles className="w-3 h-3 inline-block mr-1 -mt-0.5" />
            Featured ({GALLERY_PROJECTS.filter((p) => p.featured).length})
          </button>

          <button
            onClick={() => handleFilterChange("full")}
            className={`${styles.filterBtn} ${filter === "full" ? styles.filterBtnActive : ""}`}
          >
            <Layers className="w-3 h-3 inline-block mr-1 -mt-0.5" />
            Full Catalog ({GALLERY_PROJECTS.length})
          </button>
        </div>
      </div>

      {/* 2. Vertical Project Title List */}
      <div ref={listRef} className={styles.galleryList}>
        {projects.map((project) => {
          const isHovered = hoveredId === project.id;
          const isDimmed = hoveredId !== null && !isHovered;

          return (
            <Link
              key={project.id}
              href={`/fleet`}
              onClick={(e) => handleProjectClick(e, project)}
              onMouseEnter={() => handleRowMouseEnter(project)}
              onMouseLeave={handleRowMouseLeave}
              className={`${styles.projectRow} ${isDimmed ? styles.dimmedRow : ""} ${isHovered ? styles.hoveredRow : ""}`}
            >
              <div className="flex items-center gap-3">
                <span className={styles.projectTitle}>{project.title}</span>
                <ArrowUpRight className={`w-6 h-6 transition-transform duration-300 ${isHovered ? "translate-x-1 -translate-y-1 text-yellow-400 opacity-100" : "opacity-0"}`} />
              </div>

              <div className={styles.projectMeta}>
                <span className={styles.projectTag}>{project.category}</span>
                <span>{project.location}</span>
                <span>{project.year}</span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* 3. Cursor-Following Floating Cover Image Preview */}
      <div ref={previewRef} className={styles.cursorPreviewContainer}>
        {activeCover && (
          <>
            <Image
              src={activeCover.coverImage}
              alt={activeCover.title}
              fill
              sizes="280px"
              className={styles.cursorPreviewImg}
              priority
            />
            <div className={styles.previewOverlay}>
              <span className={styles.previewTitle}>{activeCover.title}</span>
              <span className={styles.previewSub}>{activeCover.subtitle}</span>
            </div>
          </>
        )}
      </div>

      {/* 4. Minimal Footer Bar */}
      <div className={styles.galleryFooter}>
        <div className={styles.socialLinks}>
          <a href="tel:+919999999999" className={styles.socialLink}>24/7 Dispatch</a>
          <span>&bull;</span>
          <a href="mailto:info@temptravels.com" className={styles.socialLink}>Corporate Desk</a>
          <span>&bull;</span>
          <span className="text-slate-500">ISO 9001:2015 Certified</span>
        </div>

        <div className={styles.taglineText}>
          <span>Interactive Shader Wipes &bull; Lenis Motion Engine</span>
        </div>
      </div>

    </section>
  );
}
