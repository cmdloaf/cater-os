import { cn } from "@/lib/utils";

/**
 * Soft, almost-white decorative graphic for the dashboard — a mint ring plus
 * lavender/pink blobs and a couple of tiny accent dots, bleeding in from the
 * top-right corner. Kept very pale so the surface still reads near-white and
 * the color is ambient texture, not a status signal.
 */
export function DashboardAccent({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 560 420"
      className={cn("pointer-events-none select-none", className)}
    >
      <defs>
        <radialGradient id="da-lavender" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#a78bfa" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="da-pink" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f9a8c4" stopOpacity="0.26" />
          <stop offset="100%" stopColor="#f9a8c4" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="da-mint" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#5dbb92" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#5dbb92" stopOpacity="0" />
        </radialGradient>
        <filter id="da-blur" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
      </defs>

      <g filter="url(#da-blur)">
        {/* Pale mint ring/arc */}
        <circle
          cx="410"
          cy="150"
          r="150"
          fill="none"
          stroke="#5dbb92"
          strokeOpacity="0.18"
          strokeWidth="34"
        />
        {/* Large lavender blob */}
        <circle cx="470" cy="230" r="185" fill="url(#da-lavender)" />
        {/* Soft pink blob */}
        <circle cx="250" cy="180" r="140" fill="url(#da-pink)" />
        {/* Faint mint wash lower-left */}
        <circle cx="150" cy="300" r="120" fill="url(#da-mint)" />
      </g>

      {/* Tiny solid accent dots */}
      <circle cx="300" cy="70" r="6" fill="#5dbb92" fillOpacity="0.7" />
      <circle cx="300" cy="175" r="5" fill="#5dbb92" fillOpacity="0.6" />
      <circle cx="120" cy="230" r="5" fill="#5dbb92" fillOpacity="0.55" />
      <circle cx="110" cy="130" r="6" fill="#a78bfa" fillOpacity="0.55" />
    </svg>
  );
}
