# Prompt for Antigravity — "Jesper Landberg style" project gallery in Next.js

Copy everything below into Antigravity as your task/build prompt.

---

## Goal

Build a full-screen, text-based project gallery for my Next.js (App Router) site, styled after jesperlandberg.com. The gallery is a **vertical list of project titles** (not an image grid). On hover, a small image preview follows the cursor showing that project's cover. On click, the page transitions into the project/case-study view using a WebGL shader wipe instead of a plain route change. Scrolling is buttery-smooth (Lenis), and all animation timing is driven by GSAP.

## Tech stack to install

- `gsap` (with `ScrollTrigger` plugin)
- `lenis` (`@studio-freight/lenis` or the current `lenis` package + its React wrapper if using App Router)
- `ogl` — a lightweight WebGL library (NOT three.js) for the shader transition. This keeps bundle size small and is the actual library this style of site uses.
- CSS Modules or SCSS Modules for styling (BEM-ish class naming), not Tailwind, so we have full control over the custom grid rhythm.

## 1. Layout & grid system

- Build a strict column/row grid (CSS Grid) that governs gutters and rhythm sitewide — header, nav, footer, and the gallery list should all sit on the same grid, not approximate it.
- Full-bleed viewport section: gallery fills `100dvh`, no scroll chrome, minimal UI (logo/name top-left, nav top-right, small "Featured / Full" toggle, social links bottom-left, award count / tagline bottom-right).

## 2. The gallery list

- Each project is a single line: a large, weight-light sans-serif title (e.g. 4–6vw clamp size), left-aligned, one per row, generous vertical spacing.
- Each row is a real `<Link>` (Next.js `next/link`) wrapping the title text — keep it accessible and SEO-crawlable, don't fake it with divs.
- On mouse enter of a row:
  - Underline or weight of the text animates in with GSAP (`gsap.to`, short duration ~0.3–0.4s, custom ease like `power3.out`).
  - Sibling rows fade to a lower opacity (e.g. 0.3) so the hovered title pops — classic "spotlight list" effect.
- Add a subtle marquee/duplicate-text-on-hover option if you want extra flourish (optional, skip if it feels like too much).

## 3. Cursor-following image preview

- A single fixed-position `<div>` (image container, ~260×340px, `border-radius: 4px`, `overflow: hidden`) that is absolutely positioned and follows the mouse using `requestAnimationFrame` + `gsap.quickTo()` for x/y (quickTo gives you a cheap, performant lerp/lag rather than snapping directly to the cursor).
- On row hover:
  - Swap the `<img>`/`next/image` src to that project's cover image.
  - Scale the container in from 0 → 1 with a slight overshoot ease (`back.out(1.2)`) and fade opacity 0 → 1.
  - On hover-out, scale back down and fade out.
- The container should have `pointer-events: none` so it never blocks the real link underneath.
- Use `next/image` with `fill` and `object-fit: cover` inside the floating container for optimized loading; preload the first 2–3 covers so there's no flash on first hover.

## 4. Smooth scroll (Lenis + GSAP)

- Initialize Lenis once at the app root (a small client component, e.g. `SmoothScrollProvider`), disable native scroll, and drive it from GSAP's ticker rather than its own RAF loop so everything shares one clock:

```js
import Lenis from 'lenis'
import gsap from 'gsap'

const lenis = new Lenis()
lenis.on('scroll', ScrollTrigger.update)

gsap.ticker.add((time) => {
  lenis.raf(time * 1000)
})
gsap.ticker.lagSmoothing(0)
```

- Wrap this in a `useEffect` inside a client component that mounts once at the layout level, and clean up (`lenis.destroy()`) on unmount.

## 5. WebGL shader transition (the signature effect)

This is the centerpiece: when a title is clicked, don't just route-change — run a short (0.8–1.2s) full-screen WebGL transition over the current view before/while the new project route loads underneath.

- Set up a single full-viewport `<canvas>` rendered via OGL, mounted once at the root layout (behind normal DOM, `position: fixed; inset: 0; z-index: 9999` and toggled visible only during a transition).
- The **entire animation is driven by one uniform**: a `progress` float between 0 and 1.
  - GSAP tweens a plain JS object's `progress` value from 0 → 1 with a custom ease over the transition duration.
  - On every `onUpdate`, write that value into the shader's uniform (`program.uniforms.uProgress.value = progress`) — GSAP owns the motion curve, the shader itself stays "dumb"/stateless.
- In the fragment shader, use `uProgress` to drive 2–3 combined effects for the wipe:
  - **Block/tile snap**: divide the screen into a coarse grid (e.g. 6×4 cells) and reveal cells in a staggered pattern based on `uProgress` + per-cell random offset (classic "shutter" reveal).
  - **Pixel displacement / warp**: sample the texture with a UV offset derived from a noise function scaled by `(1.0 - abs(uProgress - 0.5) * 2.0)` so distortion peaks mid-transition and resolves at both ends.
  - **Chromatic aberration / RGB channel split**: offset the R and B channel UV samples by a small amount that also peaks mid-transition, for that glitchy color-fringe look.
- Take a snapshot of the outgoing view as a texture (canvas capture or a duplicate rendered frame) as the "source", and the incoming project's hero image as the "destination" texture; crossfade between them driven by the same `uProgress`.
- Only flag `texture.needsUpdate = true` on the two textures actually involved in the transition, not the whole texture pool — keeps it cheap.
- Combine the shader wipe with a CSS `clip-path` wipe on the DOM layer underneath for crisp edges where the WebGL canvas hands off to the real page content.
- After `progress` hits 1, use Next.js router (`router.push`) to actually swap route content, then fade the canvas out.

## 6. "Featured / Full" toggle

- Two tab-like links top-right ("Featured" / "Full") that filter the list between a curated subset and the complete project list.
- Animate the swap: fade+stagger the outgoing list rows out (upward, short stagger ~0.03s each), swap the array, stagger the new rows in.

## 7. Motion details that sell the polish

- Everything eases with custom cubic-beziers, not default `ease-in-out` — lean on `power3.out`/`expo.out` for entrances, `power2.in` for exits.
- Respect `prefers-reduced-motion`: skip the WebGL transition and cursor-follow lag for users who request reduced motion, falling back to a plain fade/instant navigation.
- Keep first paint fast: lazy-init the OGL canvas/shader only after the page is interactive, not blocking initial render.

## 8. Suggested Next.js file structure

```
app/
  layout.tsx                # mounts SmoothScrollProvider + TransitionCanvas
  page.tsx                  # renders <ProjectGallery />
components/
  smooth-scroll-provider.tsx
  project-gallery/
    project-gallery.tsx
    project-row.tsx
    cursor-preview.tsx
    project-gallery.module.scss
  transition-canvas/
    transition-canvas.tsx   # OGL setup, shader source, progress uniform wiring
    shaders/
      transition.frag.glsl
      transition.vert.glsl
lib/
  gsap.ts                    # gsap + ScrollTrigger registration, shared eases
data/
  projects.ts                # id, title, slug, coverImage, featured: boolean
```

## Deliverable

Implement this end to end: the gallery list with hover spotlight + cursor-following preview, Lenis smooth scroll wired to GSAP's ticker, the OGL shader transition on click (block-snap + warp + chromatic aberration driven by a single progress uniform), the Featured/Full toggle, and reduced-motion fallbacks. Use TypeScript throughout and keep the shader and animation logic isolated in the files above so it's easy to swap easing curves or shader effects later.
