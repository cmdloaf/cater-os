"use client";

import { useEffect, useState } from "react";

/**
 * Returns true when the viewport is below the `lg` breakpoint (1024px) — i.e.
 * phones and tablets, which use the bottom nav instead of the desktop sidebar.
 *
 * SSR-safe: defaults to `false` (desktop) on the server and first paint, then
 * updates after mount. Use this only where the markup must differ between
 * desktop and mobile; prefer Tailwind responsive classes everywhere else.
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 1023px)");
    const update = () => setIsMobile(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  return isMobile;
}
