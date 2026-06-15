"use client";

import { useEffect } from "react";

/**
 * Registers the service worker on first mount. Idempotent.
 */
export function RegisterSW() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch((e) => {
      console.warn("SW registration failed:", e);
    });
  }, []);
  return null;
}
