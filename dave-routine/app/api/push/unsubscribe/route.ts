import { NextRequest, NextResponse } from 'next/server';
import { deleteSubscription, PushStoreUnavailableError } from '@/lib/push/store';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid-json' }, { status: 400 });
  }
  const endpoint = (body as Record<string, unknown>)?.endpoint;
  if (typeof endpoint !== 'string' || !endpoint) {
    return NextResponse.json({ error: 'invalid-endpoint' }, { status: 400 });
  }

  try {
    await deleteSubscription(endpoint);
  } catch (err) {
    if (err instanceof PushStoreUnavailableError) {
      return NextResponse.json({ error: 'store-not-configured' }, { status: 503 });
    }
    return NextResponse.json({ error: 'store-unavailable' }, { status: 503 });
  }

  return NextResponse.json({ ok: true });
}
