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
  ChefHat,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { collapsed, expanded, setHovered, toggle } = useSidebar();

  // Labels are hidden on the collapsed rail; they fade in once it expands.
  const labelClass = cn(
    "whitespace-nowrap transition-opacity duration-200",
    !expanded && "opacity-0"
  );

  return (
    <aside
      onPointerEnter={() => collapsed && setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      className={cn(
        "fixed inset-y-0 left-0 z-30 hidden flex-col overflow-hidden border-r border-white/10 bg-[#13231a] text-white transition-[width] duration-200 lg:flex",
        expanded ? "w-60" : "w-16"
      )}
    >
      <div className="flex h-16 items-center gap-2.5 border-b border-white/10 px-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <ChefHat className="h-5 w-5" />
        </div>
        <div className={cn("leading-tight", labelClass)}>
          <div className="text-sm font-semibold tracking-tight">CaterOS</div>
          <div className="text-[11px] text-white/50">Catering Operations</div>
        </div>
        <button
          type="button"
          onClick={toggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={cn(
            "ml-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-white/60 transition-colors hover:bg-white/10 hover:text-white",
            !expanded && "opacity-0"
          )}
        >
          {collapsed ? (
            <PanelLeftOpen className="h-[18px] w-[18px]" />
          ) : (
            <PanelLeftClose className="h-[18px] w-[18px]" />
          )}
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden p-3">
        {NAV.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" &&
              pathname.startsWith(item.href + "/"));
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              title={item.label}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-white/10 text-white"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              )}
            >
              {active && (
                <span className="absolute inset-y-1.5 left-0 w-1 rounded-r-full bg-primary" />
              )}
              <Icon className="h-[18px] w-[18px] shrink-0" />
              <span className={labelClass}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-3">
        <Link
          href="/settings"
          title="Gian Matthew"
          className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-white/10"
        >
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarFallback className="bg-white/10 text-white">GM</AvatarFallback>
          </Avatar>
          <div className={cn("leading-tight", labelClass)}>
            <div className="text-sm font-medium">Gian Matthew</div>
            <div className="text-[11px] text-white/50">Admin</div>
          </div>
        </Link>
      </div>
    </aside>
  );
}
