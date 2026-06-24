"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  FileText,
  LayoutTemplate,
  Upload,
  Settings,
  ChefHat,
} from "lucide-react";

import { cn } from "@/lib/utils";

const NAV = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Events", href: "/dashboard", icon: CalendarDays, match: "/events" },
  { label: "Documents", href: "/documents", icon: FileText },
  { label: "Templates", href: "/templates", icon: LayoutTemplate },
  { label: "Import Data", href: "/import", icon: Upload },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r bg-white lg:flex">
      <div className="flex h-16 items-center gap-2.5 border-b px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <ChefHat className="h-5 w-5" />
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold tracking-tight">CaterOS</div>
          <div className="text-[11px] text-muted-foreground">
            Catering Operations
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {NAV.map((item) => {
          const active =
            pathname === item.href ||
            pathname.startsWith(item.href + "/") ||
            (item.match ? pathname.startsWith(item.match) : false);
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {active && (
                <span className="absolute inset-y-1.5 left-0 w-1 rounded-r-full bg-primary" />
              )}
              <Icon className="h-[18px] w-[18px]" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-3">
        <div className="rounded-lg bg-accent/60 p-3">
          <div className="text-xs font-medium text-accent-foreground">
            Single Source of Truth
          </div>
          <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
            Every quotation, contract & event order is generated from one Event
            Record.
          </p>
        </div>
      </div>
    </aside>
  );
}
