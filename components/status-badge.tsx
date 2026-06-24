import { cn } from "@/lib/utils";
import type { EventStatus } from "@/lib/types";

const STATUS_STYLES: Record<EventStatus, string> = {
  Draft: "bg-zinc-100 text-zinc-600 ring-zinc-200",
  "Quotation Sent": "bg-amber-50 text-amber-700 ring-amber-200",
  Confirmed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Upcoming: "bg-blue-50 text-blue-700 ring-blue-200",
  Completed: "bg-zinc-100 text-zinc-500 ring-zinc-200",
};

const STATUS_DOT: Record<EventStatus, string> = {
  Draft: "bg-zinc-400",
  "Quotation Sent": "bg-amber-500",
  Confirmed: "bg-emerald-500",
  Upcoming: "bg-blue-500",
  Completed: "bg-zinc-400",
};

export function StatusBadge({
  status,
  className,
}: {
  status: EventStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        STATUS_STYLES[status],
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", STATUS_DOT[status])} />
      {status}
    </span>
  );
}
