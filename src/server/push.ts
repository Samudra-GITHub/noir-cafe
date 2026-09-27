import "server-only";
import webpush, { type PushSubscription } from "web-push";
import { supabase } from "./supabase";

/**
 * Web Push — VAPID keys switch it on (NEXT_PUBLIC_VAPID_PUBLIC_KEY,
 * VAPID_PRIVATE_KEY, VAPID_SUBJECT). Subscriptions live in Supabase
 * (`push_subscriptions`); sending is for the café's own tools, behind
 * PUSH_ADMIN_TOKEN. Without keys the phone menu never offers notifications.
 */
export const pushEnabled = () => Boolean(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);

let configured = false;
function configure() {
  if (configured || !pushEnabled()) return;
  webpush.setVapidDetails(process.env.VAPID_SUBJECT ?? "mailto:hello@noircafe.com", process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!, process.env.VAPID_PRIVATE_KEY!);
  configured = true;
}

export function isSubscription(value: unknown): value is PushSubscription {
  const s = value as PushSubscription;
  return !!s && typeof s.endpoint === "string" && /^https:\/\//.test(s.endpoint) && typeof s.keys?.p256dh === "string" && typeof s.keys?.auth === "string";
}

export async function saveSubscription(sub: PushSubscription) {
  const db = supabase();
  if (!db) return { stored: false };
  const { error } = await db.from("push_subscriptions").upsert({ endpoint: sub.endpoint, keys: sub.keys }, { onConflict: "endpoint" });
  if (error) throw new Error(`push_subscriptions upsert: ${error.message}`);
  return { stored: true };
}

export async function removeSubscription(endpoint: string) {
  await supabase()?.from("push_subscriptions").delete().eq("endpoint", endpoint);
}

/** Send to every subscriber; expired subscriptions (404/410) are removed. */
export async function broadcast(payload: { title: string; body: string; url?: string; tag?: string }) {
  configure();
  const db = supabase();
  if (!configured || !db) return { sent: 0, removed: 0 };
  const { data } = await db.from("push_subscriptions").select("endpoint, keys");
  let sent = 0;
  let removed = 0;
  for (const row of data ?? []) {
    try {
      await webpush.sendNotification({ endpoint: row.endpoint as string, keys: row.keys as PushSubscription["keys"] }, JSON.stringify(payload));
      sent++;
    } catch (error) {
      const status = (error as { statusCode?: number }).statusCode;
      if (status === 404 || status === 410) {
        await removeSubscription(row.endpoint as string);
        removed++;
      }
    }
  }
  return { sent, removed };
}
