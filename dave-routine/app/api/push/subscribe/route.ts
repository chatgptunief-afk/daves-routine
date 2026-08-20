import { NextRequest, NextResponse } from 'next/server';
import { saveSubscription, PushStoreUnavailableError } from '@/lib/push/store';

export const runtime = 'nodejs';

function isValidTime(v: unknown): v is string {
  return typeof v === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(v);
}

function isValidTimezone(tz: unknown): tz is string {
  if (typeof tz !== 'string' || !tz) return false;
  try {
    // eslint-disable-next-line no-new
    new Intl.DateTimeFormat('en-US', { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

// Slaat een pushabonnement + voorkeuren op. Wordt aangeroepen bij het inschakelen van
// meldingen én telkens wanneer relevante instellingen wijzigen (zie lib/push/client.ts).
// Vertrouwt geen enkel veld uit de request blindelings — alles wordt gevalideerd of vervangen
// door een veilige default.
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid-json' }, { status: 400 });
  }
  const b = body as Record<string, unknown>;

  const sub = b?.subscription as Record<string, unknown> | undefined;
  const keys = sub?.keys as Record<string, unknown> | undefined;
  if (
    !sub ||
    typeof sub.endpoint !== 'string' ||
    !sub.endpoint.startsWith('https://') ||
    !keys ||
    typeof keys.p256dh !== 'string' ||
    typeof keys.auth !== 'string'
  ) {
    return NextResponse.json({ error: 'invalid-subscription' }, { status: 400 });
  }

  const timezone = isValidTimezone(b.timezone) ? (b.timezone as string) : 'UTC';

  const prefsIn = (b.prefs as Record<string, unknown>) ?? {};
  const prefs = {
    notificationsEnabled: !!prefsIn.notificationsEnabled,
    notifMorningEnabled: !!prefsIn.notifMorningEnabled,
    notifMorningTime: isValidTime(prefsIn.notifMorningTime) ? (prefsIn.notifMorningTime as string) : '07:30',
    notifRoutineEnabled: !!prefsIn.notifRoutineEnabled,
    notifEveningEnabled: !!prefsIn.notifEveningEnabled,
    notifEveningTime: isValidTime(prefsIn.notifEveningTime) ? (prefsIn.notifEveningTime as string) : '21:30',
    notifPrayerEnabled: !!prefsIn.notifPrayerEnabled,
  };

  const prayerIn = (b.prayer as Record<string, unknown>) ?? {};
  const locationIn = prayerIn.location as Record<string, unknown> | null | undefined;
  const prayer = {
    prayerTimeSource: (prayerIn.prayerTimeSource === 'calculated' ? 'calculated' : 'manual') as 'calculated' | 'manual',
    location:
      locationIn && typeof locationIn.lat === 'number' && typeof locationIn.lng === 'number'
        ? { lat: locationIn.lat, lng: locationIn.lng }
        : null,
    manualPrayerTimes:
      prayerIn.manualPrayerTimes && typeof prayerIn.manualPrayerTimes === 'object'
        ? (prayerIn.manualPrayerTimes as Record<string, string>)
        : null,
  };

  const hasAnkers = !!b.hasAnkers;

  try {
    await saveSubscription({
      subscription: { endpoint: sub.endpoint, keys: { p256dh: keys.p256dh, auth: keys.auth } },
      timezone,
      prefs,
      prayer,
      hasAnkers,
      updatedAt: Date.now(),
    });
  } catch (err) {
    if (err instanceof PushStoreUnavailableError) {
      return NextResponse.json({ error: 'store-not-configured' }, { status: 503 });
    }
    return NextResponse.json({ error: 'store-unavailable' }, { status: 503 });
  }

  return NextResponse.json({ ok: true });
}
