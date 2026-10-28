"use client";

import { useEffect, useRef } from "react";

const SPACING = 15;
const MAX_R = SPACING * 0.62;
const INFLUENCE = 190;

/**
 * A halftone screen in fluorescent pink. Dot size follows a diagonal
 * gradient that slowly breathes, and ink pools around the pointer.
 * Rendering pauses whenever the canvas is off screen.
 */
export function HalftoneField({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const color = getComputedStyle(document.documentElement).getPropertyValue("--pink").trim() || "#ff48b0";

    let w = 0;
    let h = 0;
    let cols = 0;
    let rows = 0;
    let raf = 0;
    let visible = true;
    // Pointer position eased toward its target so the pool of ink lags behind.
    const pointer = { x: -9999, y: -9999, tx: -9999, ty: -9999, strength: 0, target: 0 };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(w / SPACING) + 1;
      rows = Math.ceil(h / SPACING) + 1;
    };

    const draw = (t: number) => {
      pointer.x += (pointer.tx - pointer.x) * 0.12;
      pointer.y += (pointer.ty - pointer.y) * 0.12;
      pointer.strength += (pointer.target - pointer.strength) * 0.08;

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = color;
      ctx.beginPath();

      const time = t * 0.00025;
      const invW = 1 / w;
      const invH = 1 / h;
      for (let j = 0; j < rows; j++) {
        // Offset every other row: a 45° screen angle, like a real halftone.
        const y = j * SPACING;
        const shift = j % 2 ? SPACING / 2 : 0;
        for (let i = 0; i < cols; i++) {
          const x = i * SPACING + shift;

          // Ramp from empty on the left to dense on the right, a little
          // heavier toward the bottom. Normalised per axis so it holds on phones.
          let v = x * invW * 0.9 + y * invH * 0.35 - 0.42;
          v += Math.sin(x * 0.006 + time * 3) * 0.08 + Math.cos(y * 0.008 - time * 2) * 0.08;

          const dx = x - pointer.x;
          const dy = y - pointer.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < INFLUENCE * INFLUENCE) {
            const falloff = 1 - Math.sqrt(d2) / INFLUENCE;
            v += falloff * falloff * 0.75 * pointer.strength;
          }

          if (v <= 0.04) continue;
          const r = Math.min(v, 1) * MAX_R;
          ctx.moveTo(x + r, y);
          ctx.arc(x, y, r, 0, Math.PI * 2);
        }
      }
      ctx.fill();
    };

    let frame = 0;
    const loop = (t: number) => {
      // With no pointer nearby the field only breathes, so half the frame rate is plenty.
      if (pointer.strength > 0.01 || pointer.target > 0 || frame++ % 2 === 0) draw(t);
      raf = visible ? requestAnimationFrame(loop) : 0;
    };

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.tx = e.clientX - rect.left;
      pointer.ty = e.clientY - rect.top;
      if (pointer.x < -1000) {
        pointer.x = pointer.tx;
        pointer.y = pointer.ty;
      }
      pointer.target = 1;
    };
    const onLeave = () => {
      pointer.target = 0;
    };

    resize();
    const ro = new ResizeObserver(() => {
      resize();
      if (reduced) draw(0);
    });
    ro.observe(canvas);

    if (reduced) {
      draw(0);
      return () => ro.disconnect();
    }

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(loop);
    });
    io.observe(canvas);

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden className={className} />;
}
