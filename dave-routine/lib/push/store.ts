// Server-only opslag voor pushabonnementen — géén nieuw framework, gewoon de Redis REST-API
// (Vercel KV of Upstash zijn hetzelfde protocol) via fetch(). Geen extra npm-package nodig.
// Zie PUSH.md voor welke environment variables dit vereist.
import { createHash } from 'crypto';

const SUBS_KEY = 'dagboog:push:subs';
const FIRED_PREFIX = 'dagboog:push:fired:';
const FIRED_TTL_SECONDS = 60 * 60 * 48; // 2 dagen — ruim genoeg voor dedupe, ruimt vanzelf op

export interface StoredPrefs {
  notificationsEnabled: boolean;
  notifMorningEnabled: boolean;
  notifMorningTime: string;
  notifRoutineEnabled: boolean;
  notifEveningEnabled: boolean;
  notifEveningTime: string;
  notifPrayerEnabled: boolean;
}

export interface StoredPrayerConfig {
  prayerTimeSource: 'calculated' | 'manual';
  location: { lat: number; lng: number } | null;
  manualPrayerTimes: Record<string, string> | null;
}

export interface StoredSubscription {
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } };
  timezone: string;
  prefs: StoredPrefs;
  prayer: StoredPrayerConfig;
  hasAnkers: boolean;
  updatedAt: number;
}

export class PushStoreUnavailableError extends Error {
  constructor() {
    super('Push-opslag is niet geconfigureerd — KV_REST_API_URL/TOKEN of UPSTASH_REDIS_REST_URL/TOKEN ontbreken.');
    this.name = 'PushStoreUnavailableError';
  }
}

export function isStoreConfigured(): boolean {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  return !!url && !!token;
}

async function redisCommand(cmd: (string | number)[]): Promise<unknown> {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new PushStoreUnavailableError();
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(cmd),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Redis-opdracht mislukt (${res.status})`);
  const data = (await res.json()) as { result: unknown };
  return data.result;
}

export function endpointHash(endpoint: string): string {
  return createHash('sha256').update(endpoint).digest('hex').slice(0, 24);
}

export async function saveSubscription(record: StoredSubscription): Promise<void> {
  const hash = endpointHash(record.subscription.endpoint);
  await redisCommand(['HSET', SUBS_KEY, hash, JSON.stringify(record)]);
}

export async function deleteSubscription(endpoint: string): Promise<void> {
  const hash = endpointHash(endpoint);
  await redisCommand(['HDEL', SUBS_KEY, hash]);
}

export async function listSubscriptions(): Promise<StoredSubscription[]> {
  const raw = await redisCommand(['HGETALL', SUBS_KEY]);
  const out: StoredSubscription[] = [];
  if (!Array.isArray(raw)) return out;
  // Upstash/Redis HGETALL via de REST-API levert een platte [field, value, field, value, ...] array.
  for (let i = 1; i < raw.length; i += 2) {
    try { out.push(JSON.parse(raw[i] as string)); } catch { /* corrupte entry overslaan, niet crashen */ }
  }
  return out;
}

export async function wasFired(key: string): Promise<boolean> {
  const res = await redisCommand(['EXISTS', FIRED_PREFIX + key]);
  return res === 1;
}

export async function markFired(key: string): Promise<void> {
  await redisCommand(['SET', FIRED_PREFIX + key, '1', 'EX', FIRED_TTL_SECONDS]);
}
