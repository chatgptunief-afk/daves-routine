import { NextRequest, NextResponse } from 'next/server';
import webpush, { type PushSubscription as WebPushSubscription } from 'web-push';
import {
  listSubscriptions, deleteSubscription, wasFired, markFired,
  isStoreConfigured, endpointHash, type StoredSubscription,
} from '@/lib/push/store';
import { getCurrentPrayerWindow } from '@/lib/phase';
import { calculatePrayerTimes, manualToPrayerTimes, DEFAULT_MANUAL_TIMES } from '@/lib/prayerTimes';
import type { PrayerTimes } from '@/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PRAYER_NAMES: Record<string, string> = { fajr: 'Fajr', dhuhr: 'Dhuhr', asr: 'Asr', maghrib: 'Maghrib', isha: 'Isha' };

// Lokale datum + kloktijd van de gebruiker, puur met Intl — geen extra package nodig.
function localDateAndTime(timezone: string, at: Date): { date: string; hhmm: string } {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  });
  const parts: Record<string, string> = {};
  for (const p of fmt.formatToParts(at)) parts[p.type] = p.value;
  return { date: `${parts.year}-${parts.month}-${parts.day}`, hhmm: `${parts.hour}:${parts.minute}` };
}

// UTC-offset in uren van een IANA-tijdzone op een gegeven moment (houdt rekening met
// zomertijd en niet-heluurse zones zoals +5:45) — puur via Intl, geen dependency.
function tzOffsetHours(timezone: string, at: Date): number {
  const utc = new Date(at.toLocaleString('en-US', { timeZone: 'UTC' }));
  const local = new Date(at.toLocaleString('en-US', { timeZone: timezone }));
  return (local.getTime() - utc.getTime()) / 3_600_000;
}

interface Job { type: string; dedupeKey: string; body: string; url: string; }

function buildJobs(record: StoredSubscription, now: Date): Job[] {
  const { date, hhmm } = localDateAndTime(record.timezone, now);
  const jobs: Job[] = [];

  if (record.prefs.notifMorningEnabled && hhmm >= record.prefs.notifMorningTime) {
    jobs.push({ type: 'morning', dedupeKey: `morning:${date}`, body: 'Je dag begint.', url: '/' });
  }
  if (record.prefs.notifEveningEnabled && hhmm >= record.prefs.notifEveningTime) {
    jobs.push({ type: 'evening', dedupeKey: `evening:${date}`, body: 'Je dag sluit af.', url: '/' });
  }
  // Ritme: server kent de dagelijkse voltooiingsstatus niet (die leeft alleen lokaal op het
  // toestel — zie PUSH.md), dus dit gaat puur op voorkeur + "heeft ankers ingesteld", niet op
  // "staat er nu nog eentje open". Dat is een bewuste, gedocumenteerde beperking.
  if (record.prefs.notifRoutineEnabled && record.hasAnkers && hhmm >= '14:00') {
    jobs.push({ type: 'routine', dedupeKey: `routine:${date}`, body: 'De volgende stap wacht.', url: '/ik/routine' });
  }
  if (record.prefs.notifPrayerEnabled) {
    try {
      const times = record.prayer.prayerTimeSource === 'calculated' && record.prayer.location
        ? calculatePrayerTimes(date, record.prayer.location, tzOffsetHours(record.timezone, now))
        : manualToPrayerTimes(date, (record.prayer.manualPrayerTimes ?? DEFAULT_MANUAL_TIMES) as Omit<PrayerTimes, 'date'>);
      const nowLocal = new Date(`${date}T${hhmm}:00`);
      const window = getCurrentPrayerWindow(nowLocal, times);
      if (window) {
        jobs.push({ type: 'prayer', dedupeKey: `prayer:${window}:${date}`, body: `Het is ${PRAYER_NAMES[window] ?? window}.`, url: '/' });
      }
    } catch {
      // gebedstijdberekening mislukt voor deze gebruiker (bv. rare coördinaten) — overslaan
    }
  }

  return jobs;
}

// Wordt periodiek aangeroepen door Vercel Cron (zie vercel.json). Stuurt alleen wat op basis
// van échte, gesynchroniseerde data hoort te gaan — nooit een vaste tekst zonder aanleiding.
export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = req.headers.get('authorization');
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
  }

  const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
  const vapidSubject = process.env.VAPID_SUBJECT;
  if (!vapidPublic || !vapidPrivate || !vapidSubject) {
    return NextResponse.json({ error: 'vapid-not-configured' }, { status: 503 });
  }
  if (!isStoreConfigured()) {
    return NextResponse.json({ error: 'store-not-configured' }, { status: 503 });
  }

  webpush.setVapidDetails(vapidSubject, vapidPublic, vapidPrivate);

  const now = new Date();
  const subs = await listSubscriptions();
  let sent = 0;
  let removed = 0;
  let skipped = 0;

  for (const record of subs) {
    if (!record.prefs.notificationsEnabled) continue;

    const jobs = buildJobs(record, now);
    const hash = endpointHash(record.subscription.endpoint);
    let subscriptionGone = false;

    for (const job of jobs) {
      if (subscriptionGone) break;
      const dedupeKey = `${hash}:${job.dedupeKey}`;
      if (await wasFired(dedupeKey)) { skipped++; continue; }

      try {
        await webpush.sendNotification(
          record.subscription as unknown as WebPushSubscription,
          JSON.stringify({ title: 'Dagboog', body: job.body, url: job.url, tag: job.type })
        );
        await markFired(dedupeKey);
        sent++;
      } catch (err: unknown) {
        const statusCode = (err as { statusCode?: number } | null)?.statusCode;
        if (statusCode === 404 || statusCode === 410) {
          // Abonnement bestaat niet meer aan browserzijde (uitgeschreven/verlopen) — opruimen
          // i.p.v. het elke cron-tick opnieuw te blijven proberen.
          await deleteSubscription(record.subscription.endpoint);
          removed++;
          subscriptionGone = true;
        }
      }
    }
  }

  return NextResponse.json({ ok: true, checked: subs.length, sent, skipped, removed });
}
