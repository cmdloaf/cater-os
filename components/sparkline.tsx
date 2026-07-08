import { cn } from "@/lib/utils";

/** Minimal trend line — plots real bucketed counts, no fake curve. */
export function Sparkline({
  data,
  className,
}: {
  data: number[];
  className?: string;
}) {
  if (data.length < 2) return null;

  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const step = 100 / (data.length - 1);

  const points = data
    .map((v, i) => {
      const x = i * step;
      const y = 28 - ((v - min) / range) * 24 - 2;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      viewBox="0 0 100 32"
      preserveAspectRatio="none"
      className={cn("h-8 w-16", className)}
      aria-hidden="true"
    >
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
