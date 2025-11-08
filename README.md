# Giveaways API

Server-side endpoints for listing giveaways, fetching details, and performing user actions with authentication and simple rate limits. These routes use Next.js App Router and `createRouteHandlerClient<Database>({ cookies })`.

## Endpoints

- `GET /api/giveaways` — List giveaways (public, paginated)
  - Query params: `page` (default `1`), `limit` (default `20`, max `100`)
  - Rate limit: ~60/min per IP (demo-only in-memory)
  - Response: `{ success: true, data: Giveaway[], pagination: { page, limit, total, has_more } }`

- `GET /api/giveaways/:id` — Giveaway details
  - Rate limit: ~120/min per IP (demo-only in-memory)
  - Response: `{ success: true, data: Giveaway }`

- `POST /api/giveaways/:id/claim-free` — Claim one free ticket (auth required)
  - Auth: required (cookie-based)
  - Rate limit: 5/min per IP (demo-only in-memory)
  - Body: none
  - Response: `{ success: true, already: boolean }`
  - Notes:
    - Enforces single free ticket per user per giveaway using a unique index: `ON tickets (giveaway_id, user_id) WHERE is_free = true`
    - Active giveaways only

- `POST /api/giveaways/:id/donate` — Contribute to a giveaway (auth required)
  - Auth: required (cookie-based)
  - Rate limit: 10/min per IP (demo-only in-memory)
  - Body: `{ amount: number, currency?: 'USDT', note?: string }`
  - Response: `{ success: true, data: GiveawayContribution }`
  - Notes:
    - Inserts into `public.giveaway_contributions`
    - Uses donation splits from `giveaways` (`donation_split_platform|creator|prize`), normalizing to sum to 1
    - Requires giveaway status `active`

- `POST /api/giveaways/enter` — Paid entry (auth required)
  - Auth: required (cookie-based)
  - Rate limit: 20/min per IP (demo-only in-memory)
  - Body: `{ giveaway_id: string, quantity?: number }`
  - Response: `{ success: true, data: Ticket }`
  - Notes:
    - Minimal implementation inserts non-free tickets
    - Payment and ledger updates are handled elsewhere
    - Requires giveaway status `active`

## Example (`claim-free` route)

```ts
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase';
import { cookies } from 'next/headers';

// simple in-memory rate limiter per IP (for demo only)
const rateMap = new Map<string, { last: number, count: number }>();

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient<Database>({ cookies: cookieStore });

  // basic rate-limit: 5 claims per minute per IP
  const ip = (req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'local') as string;
  const now = Date.now();
  const bucket = rateMap.get(ip) || { last: now, count: 0 };
  if (now - bucket.last > 60000) { bucket.count = 0; bucket.last = now; }
  bucket.count++;
  rateMap.set(ip, bucket);
  if (bucket.count > 5) return NextResponse.json({ success: false, error: 'Too many requests' }, { status: 429 });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });

  const giveawayId = params.id;

  // check giveaway active
  const { data: g } = await supabase.from('giveaways').select('id,status').eq('id', giveawayId).single();
  if (!g || g.status !== 'active') return NextResponse.json({ success: false, error: 'Not active' }, { status: 400 });

  // check existing free ticket
  const { data: existing } = await supabase
    .from('tickets')
    .select('id')
    .eq('giveaway_id', giveawayId)
    .eq('user_id', user.id)
    .eq('is_free', true)
    .limit(1);

  if (existing && existing.length) {
    return NextResponse.json({ success: true, already: true });
  }

  // insert ticket (catch unique constraint)
  const { error } = await supabase.from('tickets').insert({ giveaway_id: giveawayId, user_id: user.id, is_free: true, quantity: 1 });
  if (error) {
    console.error('ticket insert error', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, already: false });
}
```

## Production Notes

- Replace demo in-memory rate limits with a persistent or distributed solution (e.g., Upstash, Redis, or your existing `withIdempotencyAndRateLimit` middleware).
- Confirm RLS policies allow these inserts/reads for authenticated users while protecting admin-only actions.
- Ensure migration files for `giveaways`, `tickets`, `giveaway_contributions`, and indexes are applied.