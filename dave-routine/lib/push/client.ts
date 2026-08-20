// Eén gedeelde ingang voor alles wat de browser met pushabonnementen doet — gebruikt door
// zowel NotificationPrompt.tsx als de instellingenpagina, zodat er geen tweede systeem
// naast elkaar ontstaat. Puur browser-API's, geen extra package.

export interface PushPrefsPayload {
  notificationsEnabled: boolean;
  notifMorningEnabled: boolean;
  notifMorningTime: string;
  notifRoutineEnabled: boolean;
  notifEveningEnabled: boolean;
  notifEveningTime: string;
  notifPrayerEnabled: boolean;
}

export interface PushPrayerPayload {
  prayerTimeSource: 'calculated' | 'manual';
  location: { lat: number; lng: number } | null;
  manualPrayerTimes: Record<string, string> | null;
}

export interface PushSyncPayload {
  prefs: PushPrefsPayload;
  prayer: PushPrayerPayload;
  hasAnkers: boolean;
}

export type PushFailureReason = 'unsupported' | 'not-configured' | 'ios-not-installed' | 'permission-denied' | 'subscribe-failed' | 'server-error';

export function isPushSupported(): boolean {
  return typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return window.matchMedia('(display-mode: standalone)').matches || nav.standalone === true;
}

export function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

// Web Push op iOS Safari bestaat alleen binnen een op het beginscherm geïnstalleerde PWA
// (iOS 16.4+). Buiten standalone-modus heeft aanvragen geen zin — leg dat rustig uit i.p.v.
// stil te falen.
export function pushNeedsHomeScreenInstall(): boolean {
  return isIOS() && !isStandalone();
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const output = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) output[i] = rawData.charCodeAt(i);
  return output;
}

export async function getExistingSubscription(): Promise<PushSubscription | null> {
  if (!isPushSupported()) return null;
  try {
    const reg = await navigator.serviceWorker.getRegistration();
    if (!reg) return null;
    return await reg.pushManager.getSubscription();
  } catch {
    return null;
  }
}

async function postSubscription(sub: PushSubscription, payload: PushSyncPayload): Promise<boolean> {
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const res = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscription: sub.toJSON(), timezone, ...payload }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// Volledige flow: permissie moet al gegeven zijn vóór deze aanroep (die vraag hoort bij de
// UI — NotificationPrompt.tsx / Instellingen). Dit registreert de SW, maakt/hergebruikt een
// PushSubscription en synchroniseert 'm naar de server.
export async function subscribeToPush(payload: PushSyncPayload): Promise<{ ok: boolean; reason?: PushFailureReason }> {
  if (!isPushSupported()) return { ok: false, reason: 'unsupported' };
  if (pushNeedsHomeScreenInstall()) return { ok: false, reason: 'ios-not-installed' };
  if (Notification.permission !== 'granted') return { ok: false, reason: 'permission-denied' };

  const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!vapidKey) return { ok: false, reason: 'not-configured' };

  try {
    const reg = await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey) as BufferSource,
      });
    }
    const ok = await postSubscription(sub, payload);
    return ok ? { ok: true } : { ok: false, reason: 'server-error' };
  } catch {
    return { ok: false, reason: 'subscribe-failed' };
  }
}

// Stuurt actuele voorkeuren naar de server voor een BESTAAND abonnement. Maakt er geen nieuw
// aan — dat gebeurt alleen via een expliciete gebruikersactie in subscribeToPush().
export async function syncPushPreferences(payload: PushSyncPayload): Promise<void> {
  const sub = await getExistingSubscription();
  if (!sub) return;
  await postSubscription(sub, payload);
}

export async function unsubscribeFromPush(): Promise<void> {
  const sub = await getExistingSubscription();
  if (!sub) return;
  try {
    await fetch('/api/push/unsubscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint: sub.endpoint }),
    });
  } catch {
    // server niet bereikbaar — lokaal toch opzeggen, anders blijft de knop "aan" ogen
  }
  try { await sub.unsubscribe(); } catch {}
}
