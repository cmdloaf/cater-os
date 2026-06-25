"use client";

import * as React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const STORAGE_KEY = "cateros:sidebar-collapsed";

interface SidebarContextValue {
  /** Persisted user choice. */
  collapsed: boolean;
  /** Whether the rail is currently hovered (collapsed only). */
  hovered: boolean;
  /** Effective display state: full sidebar when not collapsed, or when hovered. */
  expanded: boolean;
  setCollapsed: (v: boolean) => void;
  setHovered: (v: boolean) => void;
  toggle: () => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [hovered, setHovered] = useState(false);

  // Hydrate from localStorage after mount (avoids SSR mismatch).
  useEffect(() => {
    try {
      setCollapsed(window.localStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, collapsed ? "1" : "0");
    } catch {
      /* ignore quota / private-mode errors */
    }
  }, [collapsed]);

  // Collapsing takes effect immediately even if the pointer is still over the
  // sidebar — it only re-expands once the pointer leaves and re-enters the rail.
  const toggle = useCallback(() => {
    setCollapsed((c) => !c);
    setHovered(false);
  }, []);

  const expanded = !collapsed || hovered;

  const value = useMemo(
    () => ({ collapsed, hovered, expanded, setCollapsed, setHovered, toggle }),
    [collapsed, hovered, expanded, toggle]
  );

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used within a SidebarProvider");
  return ctx;
}
