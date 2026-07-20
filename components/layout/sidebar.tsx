"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Package,
  UtensilsCrossed,
  PlusCircle,
  LayoutTemplate,
  BarChart3,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  UploadCloud,
  Bell,
  ChevronDown,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogoMark } from "@/components/logo";
import { useSidebar } from "./sidebar-context";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Events", href: "/events", icon: CalendarDays },
  { label: "Packages", href: "/packages", icon: Package },
  { label: "Menus", href: "/menus", icon: UtensilsCrossed },
  { label: "Add-ons", href: "/addons", icon: PlusCircle },
  { label: "Templates", href: "/templates", icon: LayoutTemplate },
  { label: "Reports", href: "/reports", icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();
  const { collapsed, expanded, setHovered, toggle } = useSidebar();

  // Labels are hidden on the collapsed rail; they fade in once it expands.
  const labelClass = cn(
    "whitespace-nowrap transition-opacity duration-200",
    !expanded && "opacity-0"
  );

  const navLink = (item: (typeof NAV)[number]) => {
    const active =
      pathname === item.href ||
      (item.href !== "/dashboard" && pathname.startsWith(item.href + "/"));
    const Icon = item.icon;
    return (
      <Link
        key={item.label}
        href={item.href}
        title={item.label}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          active
            ? "bg-white/10 text-white"
            : "text-white/65 hover:bg-white/5 hover:text-white"
        )}
      >
        <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={active ? 2 : 1.75} />
        <span className={labelClass}>{item.label}</span>
      </Link>
    );
  };

  return (
    <aside
      onPointerEnter={() => collapsed && setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      className={cn(
        "fixed inset-y-0 left-0 z-30 hidden flex-col overflow-hidden bg-sidebar text-sidebar-foreground transition-[width] duration-200 lg:flex",
        expanded ? "w-64" : "w-16"
      )}
    >
      {/* Decorative organic shapes — subtle brand curves in the lower half */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -bottom-28 -left-24 h-80 w-80 rounded-full bg-brand-mint/[0.07]" />
        <div className="absolute -bottom-48 -right-28 h-[26rem] w-[26rem] rounded-full bg-white/[0.03]" />
        <div className="absolute -right-20 top-1/3 h-64 w-64 rounded-full bg-brand-mint/[0.05]" />
      </div>

      <div className="relative flex h-16 shrink-0 items-center gap-2.5 px-4">
        <LogoMark className="h-7 w-7 shrink-0 text-white" />
        <div className={cn("leading-tight", labelClass)}>
          <div className="text-[15px] font-semibold tracking-tight">vero</div>
          <div className="text-[11px] text-white/50">Catering Operations</div>
        </div>
        <button
          type="button"
          onClick={toggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={cn(
            "ml-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10 text-white/60 transition-colors hover:bg-white/10 hover:text-white",
            !expanded && "opacity-0"
          )}
        >
          {collapsed ? (
            <PanelLeftOpen className="h-3.5 w-3.5" />
          ) : (
            <PanelLeftClose className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      <nav className="relative flex-1 space-y-1 overflow-y-auto overflow-x-hidden p-3">
        {NAV.map(navLink)}
        <div className="!my-4 border-t border-white/10" />
        {navLink({ label: "Settings", href: "/settings", icon: Settings })}
      </nav>

      {/* Storage / upload card */}
      {expanded && (
        <div className="relative px-3 pb-2">
          <Link
            href="/import"
            className="block rounded-2xl border border-white/10 bg-white/5 p-4 text-center transition-colors hover:bg-white/10"
          >
            <span className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-white/10">
              <UploadCloud className="h-4 w-4 text-white/80" />
            </span>
            <span className="mt-2 block text-sm font-semibold">Upload Files</span>
            <span className="mt-0.5 block text-[11px] leading-snug text-white/50">
              Drag and drop or click to upload
            </span>
            <span className="mt-3 block h-1.5 overflow-hidden rounded-full bg-white/10">
              <span className="block h-full w-1/4 rounded-full bg-brand-mint" />
            </span>
            <span className="mt-1.5 block text-[10px] text-white/40">
              12.4 GB of 50 GB used
            </span>
          </Link>
        </div>
      )}

      <div className="relative flex items-center gap-1 p-3">
        <Link
          href="/settings"
          title="Gian Matthew"
          className="flex min-w-0 flex-1 items-center gap-2.5 rounded-lg p-1.5 transition-colors hover:bg-white/5"
        >
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarFallback className="bg-white/10 text-white">GM</AvatarFallback>
          </Avatar>
          <span className={cn("min-w-0 leading-tight", labelClass)}>
            <span className="block truncate text-sm font-medium">Gian Matthew</span>
            <span className="block text-[11px] text-white/50">Operations</span>
          </span>
          <ChevronDown className={cn("h-3.5 w-3.5 shrink-0 text-white/50", labelClass)} />
        </Link>
        <button
          type="button"
          aria-label="Notifications"
          className={cn(
            "relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/60 transition-colors hover:bg-white/10 hover:text-white",
            !expanded && "hidden"
          )}
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-brand-mint ring-2 ring-sidebar" />
        </button>
      </div>
    </aside>
  );
}
