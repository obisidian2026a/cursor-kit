import { notFound } from "next/navigation";
import dynamic from "next/dynamic";
import { CURSORS } from "@/lib/cursors";
import CursorShowcase from "@/components/ui/CursorShowcase";

// Each cursor is dynamically imported — only loads when that page is visited
const CURSOR_COMPONENTS: Record<string, React.ComponentType> = {
  // ─── Original 20 ──────────────────────────────────────────────────────────
  "flair-trail":    dynamic(() => import("@/components/cursors/FlairTrail")),
  "magnetic":       dynamic(() => import("@/components/cursors/MagneticCursor")),
  "ink-bleed":      dynamic(() => import("@/components/cursors/InkBleed")),
  "particle-burst": dynamic(() => import("@/components/cursors/ParticleBurst")),
  "ghost-trail":    dynamic(() => import("@/components/cursors/GhostTrail")),
  "spotlight":      dynamic(() => import("@/components/cursors/Spotlight")),
  "ripple":         dynamic(() => import("@/components/cursors/Ripple")),
  "text-trail":     dynamic(() => import("@/components/cursors/TextTrail")),
  "smear":          dynamic(() => import("@/components/cursors/Smear")),
  "constellation":  dynamic(() => import("@/components/cursors/Constellation")),
  "shockwave":      dynamic(() => import("@/components/cursors/Shockwave")),
  "dna-helix":      dynamic(() => import("@/components/cursors/DnaHelix")),
  "neon-glow":      dynamic(() => import("@/components/cursors/NeonGlow")),
  "smoke":          dynamic(() => import("@/components/cursors/Smoke")),
  "wormhole":       dynamic(() => import("@/components/cursors/Wormhole")),
  "typewriter":     dynamic(() => import("@/components/cursors/Typewriter")),
  "aurora":         dynamic(() => import("@/components/cursors/Aurora")),
  "shatter":        dynamic(() => import("@/components/cursors/Shatter")),
  "liquid-mercury": dynamic(() => import("@/components/cursors/LiquidMercury")),
  "shadow-clone":   dynamic(() => import("@/components/cursors/ShadowClone")),

  // ─── New 20 ───────────────────────────────────────────────────────────────
  "firefly":        dynamic(() => import("@/components/cursors/Firefly")),
  "vine":           dynamic(() => import("@/components/cursors/Vine")),
  "raindrop":       dynamic(() => import("@/components/cursors/Raindrop")),
  "pollen":         dynamic(() => import("@/components/cursors/Pollen")),
  "lava-lamp":      dynamic(() => import("@/components/cursors/LavaLamp")),
  "glitch":         dynamic(() => import("@/components/cursors/Glitch")),
  "matrix-rain":    dynamic(() => import("@/components/cursors/MatrixRain")),
  "circuit-trace":  dynamic(() => import("@/components/cursors/CircuitTrace")),
  "pixel-trail":    dynamic(() => import("@/components/cursors/PixelTrail")),
  "hologram":       dynamic(() => import("@/components/cursors/Hologram")),
  "confetti":       dynamic(() => import("@/components/cursors/Confetti")),
  "bubble-wrap":    dynamic(() => import("@/components/cursors/BubbleWrap")),
  "crayon":         dynamic(() => import("@/components/cursors/Crayon")),
  "stardust":       dynamic(() => import("@/components/cursors/Stardust")),
  "string":         dynamic(() => import("@/components/cursors/String")),
  "blade":          dynamic(() => import("@/components/cursors/Blade")),
  "void":           dynamic(() => import("@/components/cursors/Void")),
  "lightning":      dynamic(() => import("@/components/cursors/Lightning")),
  "comet":          dynamic(() => import("@/components/cursors/Comet")),
  "mirror":         dynamic(() => import("@/components/cursors/Mirror")),
};

export function generateStaticParams() {
  return CURSORS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cursor   = CURSORS.find((c) => c.slug === slug);
  if (!cursor) return {};
  return {
    title:       `${cursor.name} — CursorKit`,
    description: cursor.desc,
  };
}

export default async function CursorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cursor   = CURSORS.find((c) => c.slug === slug);
  if (!cursor) notFound();

  const CursorComponent = CURSOR_COMPONENTS[cursor.slug];
  if (!CursorComponent) notFound();

  return (
    <CursorShowcase cursor={cursor}>
      <CursorComponent />
    </CursorShowcase>
  );
}
