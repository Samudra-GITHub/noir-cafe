"use client";

import { useEffect, useState } from "react";
import { Switch } from "@/components/ui";

const KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function toBytes(base64: string) {
  const pad = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + pad).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

/**
 * Notifications switch for the phone menu sheet — only when push is
 * configured (VAPID key) and the browser supports it (on iOS: once Noir is
 * added to the home screen). Asks permission only when switched on.
 */
export function PushSwitch() {
  const [supported, setSupported] = useState(false);
  const [on, setOn] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!KEY || !("serviceWorker" in navigator) || !("PushManager" in window)) return;
    let alive = true;
    void navigator.serviceWorker.ready.then(async (reg) => {
      const sub = await reg.pushManager.getSubscription();
      if (!alive) return;
      setSupported(true);
      setOn(Boolean(sub));
    });
    return () => {
      alive = false;
    };
  }, []);

  if (!supported) return null;

  const toggle = async (next: boolean) => {
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      if (next) {
        const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: toBytes(KEY!) });
        const res = await fetch("/api/push/subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ subscription: sub.toJSON() }) });
        setOn(res.ok);
      } else {
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
          await fetch("/api/push/subscribe", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ endpoint: sub.endpoint }) });
          await sub.unsubscribe();
        }
        setOn(false);
      }
    } catch {
      setOn(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Switch
      checked={on}
      onChange={(next) => !busy && void toggle(next)}
      label="Notifications"
      description="New lots and news from the bar"
    />
  );
}
