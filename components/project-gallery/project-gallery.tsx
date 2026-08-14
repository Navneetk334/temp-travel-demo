"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { GALLERY_PROJECTS, GalleryProject } from "@/data/projects";
import { gsap } from "@/lib/gsap";
import { usePageTransition } from "@/components/transition-canvas/transition-canvas";
import styles from "./project-gallery.module.css";
import { ArrowUpRight } from "lucide-react";

export default function ProjectGallery() {
  const [filter, setFilter] = useState<"featured" | "all">("featured");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [activeProject, setActiveProject] = useState<GalleryProject | null>(null);

  const previewRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const { startTransition } = usePageTransition();

  // Mouse velocity physics variables
  const mousePos = useRef({ x: 0, y: 0, lastX: 0, lastY: 0, vx: 0, vy: 0 });
  const xTo = useRef<any>(null);
  const yTo = useRef<any>(null);
  const rotateTo = useRef<any>(null);

  const projects = filter === "featured"
    ? GALLERY_PROJECTS.filter((p) => p.featured)
    : GALLERY_PROJECTS;

  useEffect(() => {
    if (!previewRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    xTo.current = gsap.quickTo(previewRef.current, "x", { duration: 0.35, ease: "power3.out" });
    yTo.current = gsap.quickTo(previewRef.current, "y", { duration: 0.35, ease: "power3.out" });
    rotateTo.current = gsap.quickTo(previewRef.current, "rotation", { duration: 0.4, ease: "power2.out" });

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const m = mousePos.current;

      m.vx = clientX - m.lastX;
      m.vy = clientY - m.lastY;
      m.lastX = clientX;
      m.lastY = clientY;

      // Position relative to viewport center offset
      if (xTo.current && yTo.current) {
        xTo.current(clientX - 160);
        yTo.current(clientY - 210);
      }

      // Dynamic tilt rotation based on mouse movement speed
      if (rotateTo.current) {
        const tilt = Math.max(-12, Math.min(12, m.vx * 0.4));
        rotateTo.current(tilt);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const handleMouseEnterRow = (project: GalleryProject) => {
    setHoveredId(project.id);
    setActiveProject(project);

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

  const handleMouseLeaveRow = () => {
    setHoveredId(null);
    if (previewRef.current) {
      gsap.to(previewRef.current, {
        scale: 0.6,
        opacity: 0,
        duration: 0.3,
        ease: "power2.in",
        overwrite: "auto",
      });
    }
  };

  const handleFilterToggle = (newFilter: "featured" | "all") => {
    if (newFilter === filter) return;

    if (listRef.current) {
      const rows = listRef.current.children;
      gsap.to(rows, {
        opacity: 0,
        y: -12,
        stagger: 0.02,
        duration: 0.2,
        ease: "power2.in",
        onComplete: () => {
          setFilter(newFilter);
          requestAnimationFrame(() => {
            if (listRef.current) {
              const newRows = listRef.current.children;
              gsap.fromTo(
                newRows,
                { opacity: 0, y: 16 },
                {
                  opacity: 1,
                  y: 0,
                  stagger: 0.03,
                  duration: 0.45,
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

  const handleRowClick = (e: React.MouseEvent, project: GalleryProject) => {
    e.preventDefault();
    const targetUrl = project.category === "fleet" ? "/fleet" : project.category === "tours" ? "/tours" : "/corporate-inquiry";
    startTransition(targetUrl, project.coverImage);
  };

  return (
    <div className={styles.galleryWrapper}>
      
      {/* Background Subtle Grid Lines */}
      <div className={styles.gridOverlay}>
        <div className={styles.gridLine} />
        <div className={styles.gridLine} />
        <div className={styles.gridLine} />
        <div className={styles.gridLine} />
      </div>

      {/* 1. Header Bar */}
      <header className={styles.navHeader}>
        <div className={styles.brandBlock}>
          <span className={styles.brandLogo}>TEMP TRAVEL</span>
          <span className={styles.brandSub}>Jesper Landberg Visual Catalogue</span>
        </div>

        <div className={styles.controlsBlock}>
          <div className={styles.toggleContainer}>
            <button
              onClick={() => handleFilterToggle("featured")}
              className={`${styles.toggleBtn} ${filter === "featured" ? styles.toggleBtnActive : ""}`}
            >
              Selected ({GALLERY_PROJECTS.filter((p) => p.featured).length})
            </button>
            <button
              onClick={() => handleFilterToggle("all")}
              className={`${styles.toggleBtn} ${filter === "all" ? styles.toggleBtnActive : ""}`}
            >
              All Index ({GALLERY_PROJECTS.length})
            </button>
          </div>
        </div>
      </header>

      {/* 2. Vertical Project List */}
      <div ref={listRef} className={styles.listContainer}>
        {projects.map((project, idx) => {
          const isHovered = hoveredId === project.id;
          const isDimmed = hoveredId !== null && !isHovered;
          const indexStr = (idx + 1).toString().padStart(2, "0");

          return (
            <Link
              key={project.id}
              href="/fleet"
              onClick={(e) => handleRowClick(e, project)}
              onMouseEnter={() => handleMouseEnterRow(project)}
              onMouseLeave={handleMouseLeaveRow}
              className={`${styles.projectRow} ${isDimmed ? styles.dimmed : ""} ${isHovered ? styles.activeRow : ""}`}
            >
              <div className={styles.rowLeft}>
                <span className={styles.indexNum}>{indexStr}</span>
                <span className={styles.projectTitle}>{project.title}</span>
              </div>

              <div className={styles.rowRight}>
                <span className={styles.categoryTag}>{project.category}</span>
                <span>{project.location}</span>
                <span>{project.year}</span>
                <ArrowUpRight className={`w-5 h-5 transition-transform duration-300 ${isHovered ? "text-yellow-400 translate-x-1 -translate-y-1 opacity-100" : "opacity-0"}`} />
              </div>
            </Link>
          );
        })}
      </div>

      {/* 3. Floating Preview Image Box with Mouse Velocity Rotation */}
      <div ref={previewRef} className={styles.floatingPreview}>
        {activeProject && (
          <>
            <Image
              src={activeProject.coverImage}
              alt={activeProject.title}
              fill
              sizes="320px"
              className={styles.previewImage}
              priority
            />
            <div className={styles.previewInfo}>
              <span className={styles.previewTitle}>{activeProject.title}</span>
              <span className={styles.previewSubtitle}>{activeProject.subtitle}</span>
            </div>
          </>
        )}
      </div>

      {/* 4. Footer Status Bar */}
      <footer className={styles.footerSection}>
        <div className={styles.footerLeft}>
          <span>24/7 Dispatch Control</span>
          <span>&bull;</span>
          <span>ISO 9001:2015 Fleet</span>
          <span>&bull;</span>
          <span>New Delhi, India</span>
        </div>

        <div className={styles.footerRight}>
          <span>OGL WebGL Shader Wipes &bull; GSAP Motion</span>
        </div>
      </footer>

    </div>
  );
}
