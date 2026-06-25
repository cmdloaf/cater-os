"use client";

import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { useSidebar } from "./sidebar-context";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { expanded } = useSidebar();
  return (
    <div className="min-h-screen bg-zinc-50/50">
      <Sidebar />
      <div
        className={cn(
          "transition-[padding] duration-200",
          expanded ? "lg:pl-60" : "lg:pl-16"
        )}
      >
        <Topbar />
        <main className="mx-auto w-full max-w-[1400px] px-4 py-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
