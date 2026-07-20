"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  CalendarDays,
  FileText,
  FileSignature,
  Menu as MenuIcon,
  Package,
  UtensilsCrossed,
  PlusCircle,
  LayoutTemplate,
  BarChart3,
  Upload,
  Settings,
} from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const SECONDARY = [
  { label: "Packages", href: "/packages", icon: Package },
  { label: "Menus", href: "/menus", icon: UtensilsCrossed },
  { label: "Add-ons", href: "/addons", icon: PlusCircle },
  { label: "Templates", href: "/templates", icon: LayoutTemplate },
  { label: "Reports", href: "/reports", icon: BarChart3 },
  { label: "Import Data", href: "/import", icon: Upload },
  { label: "Settings", href: "/settings", icon: Settings },
];

const SECONDARY_PATHS = SECONDARY.map((s) => s.href);

export function BottomNav() {
  const pathname = usePathname();
  const params = useSearchParams();
  const [moreOpen, setMoreOpen] = useState(false);

  const onDocuments = pathname === "/documents";
  const isQuotation = onDocuments && params.get("type") === "Quotation";
  const moreActive = SECONDARY_PATHS.some((p) => pathname.startsWith(p));

  const items = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      active: pathname === "/dashboard",
    },
    {
      label: "Events",
      href: "/events",
      icon: CalendarDays,
      active: pathname.startsWith("/events"),
    },
    {
      label: "Quotation",
      href: "/documents?type=Quotation",
      icon: FileText,
      active: isQuotation,
    },
    {
      label: "Documents",
      href: "/documents",
      icon: FileSignature,
      active: onDocuments && !isQuotation,
    },
  ];

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t bg-card pb-[env(safe-area-inset-bottom)] lg:hidden">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 py-1.5 text-[11px] font-medium transition-colors",
                item.active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setMoreOpen(true)}
          className={cn(
            "flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 py-1.5 text-[11px] font-medium transition-colors",
            moreActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <MenuIcon className="h-5 w-5" />
          More
        </button>
      </nav>

      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl pb-[calc(env(safe-area-inset-bottom)+1rem)]">
          <SheetHeader className="text-left">
            <SheetTitle>More</SheetTitle>
          </SheetHeader>

          <Link
            href="/settings"
            onClick={() => setMoreOpen(false)}
            className="mt-2 flex items-center gap-3 rounded-lg border p-3"
          >
            <Avatar className="h-9 w-9">
              <AvatarFallback>GM</AvatarFallback>
            </Avatar>
            <div className="leading-tight">
              <div className="text-sm font-medium">Gian Matthew</div>
              <div className="text-[11px] text-muted-foreground">Admin</div>
            </div>
          </Link>

          <div className="mt-3 grid grid-cols-3 gap-2">
            {SECONDARY.map((s) => {
              const Icon = s.icon;
              const active = pathname.startsWith(s.href);
              return (
                <Link
                  key={s.label}
                  href={s.href}
                  onClick={() => setMoreOpen(false)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1.5 rounded-lg border p-3 text-center text-xs font-medium transition-colors",
                    active
                      ? "border-primary/40 bg-accent/40 text-primary"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {s.label}
                </Link>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
