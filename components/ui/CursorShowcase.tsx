"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import type { CursorMeta } from "@/lib/cursors";
import { TAG_COLORS, TAG_TEXT } from "@/lib/cursors";

interface Props {
  cursor: CursorMeta;
  children: React.ReactNode; // the cursor component goes here
}

export default function CursorShowcase({ cursor, children }: Props) {
  const hintRef = useRef<HTMLDivElement>(null);
  const totalCursors = CURSORS.length;

  // Fade hint out after 3s
  useEffect(() => {
    const t = setTimeout(() => {
      if (hintRef.current) {
        hintRef.current.style.opacity = "0";
        hintRef.current.style.transform = "translateY(8px)";
      }
    }, 3000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0a0a0a]">
      {/* ── Cursor effect layer (fills entire screen) ── */}
      {children}

      {/* ── Top bar ── */}
      <div
        className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%)",
          pointerEvents: "none",
        }}
      >
        {/* Back button */}
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-white transition-opacity hover:opacity-70"
          style={{ pointerEvents: "auto" }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
          >
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Back
        </Link>

        {/* Cursor name + tag */}
        <div
          className="flex items-center gap-3"
          style={{ pointerEvents: "none" }}
        >
          <span
            className="text-xs px-2.5 py-1 rounded-full font-medium"
            style={{
              background: TAG_COLORS[cursor.tag],
              color: TAG_TEXT[cursor.tag],
            }}
          >
            {cursor.tag}
          </span>
          <span className="text-sm font-medium text-white opacity-80">
            {cursor.name}
          </span>
        </div>

        {/* Prev / Next navigation */}
        <div
          className="flex items-center gap-1"
          style={{ pointerEvents: "auto" }}
        >
          {cursor.id > 1 && (
            <Link
              href={`/cursor/${getPrevSlug(cursor.id)}`}
              className="text-white opacity-40 hover:opacity-80 transition-opacity px-3 py-1.5 text-sm rounded-lg"
              style={{ background: "rgba(255,255,255,0.06)" }}
            >
              ← Prev
            </Link>
          )}
          {cursor.id < totalCursors && (
            <Link
              href={`/cursor/${getNextSlug(cursor.id)}`}
              className="text-white opacity-40 hover:opacity-80 transition-opacity px-3 py-1.5 text-sm rounded-lg"
              style={{ background: "rgba(255,255,255,0.06)" }}
            >
              Next →
            </Link>
          )}
        </div>
      </div>

      {/* ── Centre label (shown briefly on load) ── */}
      <div
        ref={hintRef}
        className="absolute inset-0 z-40 flex flex-col items-center justify-center pointer-events-none select-none"
        style={{ transition: "opacity 0.8s ease, transform 0.8s ease" }}
      >
        <p
          className="text-5xl font-light tracking-tight text-white mb-3"
          style={{
            fontFamily: "'Instrument Serif', serif",
            fontStyle: "italic",
            textShadow: "0 2px 40px rgba(0,0,0,0.8)",
          }}
        >
          {cursor.name}
        </p>
        <p className="text-sm text-white" style={{ opacity: 0.4 }}>
          {cursor.hint}
        </p>
      </div>

      {/* ── Bottom counter ── */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-50 pointer-events-none select-none">
        <p
          className="text-xs text-white"
          style={{ opacity: 0.2, letterSpacing: "0.12em" }}
        >
          {cursor.id} / {totalCursors}
        </p>
      </div>
    </div>
  );
}

// ─── Helpers to get prev/next slugs ───────────────────────────────────────────
// Import inline to avoid circular dep with lib/cursors
import { CURSORS } from "@/lib/cursors";

function getPrevSlug(id: number): string {
  return CURSORS.find((c) => c.id === id - 1)?.slug ?? "";
}
function getNextSlug(id: number): string {
  return CURSORS.find((c) => c.id === id + 1)?.slug ?? "";
}
