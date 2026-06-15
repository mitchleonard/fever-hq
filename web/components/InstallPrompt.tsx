"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { X, Export } from "@phosphor-icons/react";

/**
 * iOS Add-to-Home-Screen prompt. iOS Safari has no `beforeinstallprompt` event,
 * so we manually show an instructional banner for iOS users on the first visit.
 *
 * Hides when:
 *   - Already running in standalone (display-mode: standalone)
 *   - Not iOS Safari
 *   - User has dismissed (localStorage flag)
 */
const DISMISS_KEY = "feverhq:install-prompt-dismissed";

function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPhone|iPad|iPod/.test(navigator.userAgent) && !("MSStream" in window);
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as { standalone?: boolean }).standalone === true
  );
}

export function InstallPrompt() {
  const [show, setShow] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!isIOS() || isStandalone()) return;
    if (localStorage.getItem(DISMISS_KEY)) return;
    // Delay slightly so it doesn't slam the user on first paint
    const t = setTimeout(() => setShow(true), 1800);
    return () => clearTimeout(t);
  }, []);

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, "1");
    setShow(false);
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={reduce ? false : { y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="fixed left-3 right-3 bottom-3 z-40 rounded-[16px] bg-fever-gold text-fever-navy-deep p-4 shadow-2xl pointer-events-auto"
        >
          <button
            onClick={dismiss}
            aria-label="Dismiss"
            className="absolute top-3 right-3 text-fever-navy-deep/70 hover:text-fever-navy-deep"
          >
            <X size={16} weight="bold" />
          </button>
          <p className="font-display text-2xl tracking-tight leading-none mb-1">
            Install Fever HQ
          </p>
          <p className="text-sm leading-snug pr-6">
            Tap{" "}
            <Export
              size={16}
              weight="bold"
              className="inline align-text-bottom"
            />{" "}
            then <span className="font-semibold">Add to Home Screen</span> for
            game-day push alerts.
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
