"use client";

import { useEffect, useState } from "react";
import { Bell, BellRinging, Check } from "@phosphor-icons/react";

type Status = "loading" | "unsupported" | "denied" | "default" | "granted";

function urlBase64ToArrayBuffer(base64: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr.buffer;
}

export function PushOptIn() {
  const [status, setStatus] = useState<Status>("loading");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("Notification" in window) ||
      !("serviceWorker" in navigator) ||
      !("PushManager" in window)
    ) {
      setStatus("unsupported");
      return;
    }
    setStatus(Notification.permission as Status);
  }, []);

  async function enable() {
    setBusy(true);
    try {
      const perm = await Notification.requestPermission();
      setStatus(perm as Status);
      if (perm !== "granted") return;

      const reg = await navigator.serviceWorker.ready;
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) {
        console.error("Missing NEXT_PUBLIC_VAPID_PUBLIC_KEY env var");
        return;
      }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToArrayBuffer(vapidKey),
      });

      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub.toJSON()),
      });
    } catch (e) {
      console.error("Push subscribe failed:", e);
    } finally {
      setBusy(false);
    }
  }

  if (status === "loading") return null;

  if (status === "unsupported") {
    return (
      <div className="rounded-[12px] bg-white/5 border border-white/10 px-4 py-3">
        <p className="text-[10px] tracking-[0.2em] font-mono uppercase text-paper/45 mb-1">
          Push Notifications
        </p>
        <p className="text-sm text-paper/70">
          Your browser does not support push. Add to Home Screen first, then
          re-open from your home screen.
        </p>
      </div>
    );
  }

  if (status === "granted") {
    return (
      <div className="rounded-[12px] bg-fever-gold/10 border border-fever-gold/30 px-4 py-3 flex items-center gap-3">
        <Check size={18} weight="bold" className="text-fever-gold shrink-0" />
        <div className="flex-1">
          <p className="text-sm text-paper">Game-day alerts on.</p>
          <p className="text-xs text-paper/55 mt-0.5">
            15 minutes before every tipoff.
          </p>
        </div>
      </div>
    );
  }

  if (status === "denied") {
    return (
      <div className="rounded-[12px] bg-white/5 border border-white/10 px-4 py-3">
        <p className="text-sm text-paper/85 mb-1">Notifications blocked.</p>
        <p className="text-xs text-paper/55">
          Enable in your browser settings to get game-day alerts.
        </p>
      </div>
    );
  }

  return (
    <button
      onClick={enable}
      disabled={busy}
      className="w-full rounded-[12px] bg-fever-gold text-fever-navy-deep px-4 py-3 flex items-center gap-3 active:scale-[0.99] transition-transform disabled:opacity-60"
    >
      {busy ? (
        <BellRinging size={18} weight="bold" className="animate-pulse" />
      ) : (
        <Bell size={18} weight="fill" />
      )}
      <div className="flex-1 text-left">
        <p className="font-display text-xl tracking-tight leading-none">
          Turn on game-day alerts
        </p>
        <p className="text-xs opacity-80 mt-0.5">
          15 minutes before every tipoff
        </p>
      </div>
    </button>
  );
}
