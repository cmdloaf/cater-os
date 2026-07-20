import { cn } from "@/lib/utils";

/**
 * Vero logomark: an open ring orbited by a single point — the "one source of
 * truth" the rest of the record derives from. Mirrors the brand mark; kept as
 * inline SVG since no logo asset ships in this repo.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      className={cn("h-5 w-5", className)}
      aria-hidden="true"
    >
      <path
        d="M16 4.5a11.5 11.5 0 1 1-8.1 3.36"
        stroke="currentColor"
        strokeWidth="3.4"
        strokeLinecap="round"
      />
      <circle cx="24.6" cy="7" r="2.4" fill="currentColor" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark className="text-primary" />
      <span className="text-base font-semibold tracking-tight">vero</span>
    </span>
  );
}
