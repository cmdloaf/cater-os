"use client";

import { Suspense } from "react";

import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { BottomNav } from "./bottom-nav";
import { useSidebar } from "./sidebar-context";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { expanded } = useSidebar();
  return (
    <div className="min-h-screen overflow-x-clip bg-background">
      <Sidebar />
      <div
        className={cn(
          "transition-[padding] duration-200",
          expanded ? "lg:pl-64" : "lg:pl-16"
        )}
      >
        <Topbar />
        <main className="mx-auto w-full max-w-[1400px] px-4 pb-24 pt-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
      <Suspense fallback={null}>
        <BottomNav />
      </Suspense>
    </div>
  );
}
