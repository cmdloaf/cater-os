"use client";

/**
 * Catalog store — editable reference data (packages, menu sets, add-ons).
 *
 * Mirrors `lib/store.tsx`: seeds from the static catalogs in `lib/catalog.ts`
 * on first run, then persists edits to localStorage. The Packages / Menus /
 * Add-ons management pages read and mutate ONLY through this provider so a
 * future backend swap is a matter of replacing each body with a `fetch` call.
 */

import * as React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ADDON_CATALOG,
  MENU_SETS,
  PACKAGES,
  type MenuSet,
  type PackageOption,
} from "./catalog";
import type { AddOn } from "./types";

const STORAGE_KEY = "cateros:catalog:v1";

interface CatalogState {
  packages: PackageOption[];
  menuSets: MenuSet[];
  addOns: AddOn[];
}

interface CatalogContextValue extends CatalogState {
  ready: boolean;
  savePackage: (pkg: PackageOption, index: number | null) => void;
  deletePackage: (index: number) => void;
  saveMenuSet: (menu: MenuSet, index: number | null) => void;
  deleteMenuSet: (index: number) => void;
  saveAddOn: (addon: AddOn, index: number | null) => void;
  deleteAddOn: (index: number) => void;
  resetCatalog: () => void;
}

const SEED: CatalogState = {
  packages: PACKAGES,
  menuSets: MENU_SETS,
  addOns: ADDON_CATALOG,
};

const CatalogContext = createContext<CatalogContextValue | null>(null);

function loadFromStorage(): CatalogState {
  if (typeof window === "undefined") return SEED;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return SEED;
    const parsed = JSON.parse(raw) as CatalogState;
    if (!parsed.packages || !parsed.menuSets || !parsed.addOns) return SEED;
    return parsed;
  } catch {
    return SEED;
  }
}

export function CatalogProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CatalogState>(SEED);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setState(loadFromStorage());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore quota / private-mode errors */
    }
  }, [state, ready]);

  /** Insert (index === null) or replace the item at `index` in a list. */
  function upsert<T>(list: T[], item: T, index: number | null): T[] {
    if (index === null) return [...list, item];
    return list.map((x, i) => (i === index ? item : x));
  }

  const savePackage = useCallback(
    (pkg: PackageOption, index: number | null) =>
      setState((s) => ({ ...s, packages: upsert(s.packages, pkg, index) })),
    []
  );
  const deletePackage = useCallback(
    (index: number) =>
      setState((s) => ({
        ...s,
        packages: s.packages.filter((_, i) => i !== index),
      })),
    []
  );

  const saveMenuSet = useCallback(
    (menu: MenuSet, index: number | null) =>
      setState((s) => ({ ...s, menuSets: upsert(s.menuSets, menu, index) })),
    []
  );
  const deleteMenuSet = useCallback(
    (index: number) =>
      setState((s) => ({
        ...s,
        menuSets: s.menuSets.filter((_, i) => i !== index),
      })),
    []
  );

  const saveAddOn = useCallback(
    (addon: AddOn, index: number | null) =>
      setState((s) => ({ ...s, addOns: upsert(s.addOns, addon, index) })),
    []
  );
  const deleteAddOn = useCallback(
    (index: number) =>
      setState((s) => ({
        ...s,
        addOns: s.addOns.filter((_, i) => i !== index),
      })),
    []
  );

  const resetCatalog = useCallback(() => setState(SEED), []);

  const value = useMemo(
    () => ({
      ...state,
      ready,
      savePackage,
      deletePackage,
      saveMenuSet,
      deleteMenuSet,
      saveAddOn,
      deleteAddOn,
      resetCatalog,
    }),
    [
      state,
      ready,
      savePackage,
      deletePackage,
      saveMenuSet,
      deleteMenuSet,
      saveAddOn,
      deleteAddOn,
      resetCatalog,
    ]
  );

  return (
    <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
  );
}

export function useCatalog() {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error("useCatalog must be used within a CatalogProvider");
  return ctx;
}
