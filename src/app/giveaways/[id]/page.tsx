import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import Link from 'next/link';
import type { Database } from '@/types/supabase';
import PageTitle from '@/components/PageTitle';
import FreeClaimBanner from '@/components/FreeClaimBanner';
import EnterGiveawayButton from '@/components/EnterGiveawayButton';

export default async function GiveawayDetailPage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const cookieStore = await cookies();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );

  const { id } = await params;

  const spResolved: Record<string, string | string[] | undefined> | undefined = searchParams ? await searchParams : undefined;

  const { data: giveaway, error } = await (supabase as any)
    .from('giveaways')
    .select(
      `
      id,
      title,
      description,
      media_url,
      prize_amount,
      prize_pool_usdt,
      donation_pool_usdt,
      creator_earnings_usdt,
      platform_earnings_usdt,
      donation_split_platform,
      donation_split_creator,
      donation_split_prize,
      ticket_price,
      ends_at,
      status,
      tickets_count
    `
    )
    .eq('id', id)
    .limit(1)
    .single();

  if (error || !giveaway) {
    return (
      <div className="p-6">
        <PageTitle title="Giveaway Not Found" />
        <p className="text-sm text-muted-foreground mb-4">The giveaway you’re looking for doesn’t exist or is unavailable.</p>
        <Link href="/" className="text-blue-500 hover:underline">Back to giveaways</Link>
      </div>
    );
  }

  const ticketPrice = giveaway.ticket_price ?? 0;

  return (
    <div className="p-6 space-y-6">
      <PageTitle title={giveaway.title ?? 'Giveaway'} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          {giveaway.media_url ? (
            <div className="rounded-lg overflow-hidden bg-gray-100">
              <img
                src={giveaway.media_url}
                alt={giveaway.title ?? 'Giveaway'}
                className="w-full h-80 object-contain"
              />
            </div>
          ) : (
            <div className="rounded-lg p-6 border border-white/20 bg-white/10">
              <p className="text-sm text-muted-foreground">No media provided</p>
            </div>
          )}

          <div className="mt-6 rounded-lg p-6 border border-white/20 bg-white/10">
            <h2 className="text-xl font-semibold mb-2">Details</h2>
            <p className="text-sm whitespace-pre-line">{giveaway.description ?? 'No description provided.'}</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Manual claim banner when user visits with claim=free */}
          <FreeClaimBanner giveawayId={giveaway.id} show={String(spResolved?.claim || '') === 'free'} />

          <div className="rounded-lg p-6 border border-white/20 bg-white/10">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Prize Amount</span>
              <span className="text-lg font-semibold">{giveaway.prize_amount ?? 0}</span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-muted-foreground">Prize Pool</span>
              <span className="text-lg font-semibold">{Number(giveaway.prize_pool_usdt ?? 0).toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-muted-foreground">Ticket Price</span>
              <span className="text-lg font-semibold">{ticketPrice > 0 ? `$${ticketPrice.toFixed(2)}` : 'Free'}</span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-muted-foreground">Ends At</span>
              <span className="text-sm">{giveaway.ends_at ? new Date(giveaway.ends_at).toLocaleString() : '—'}</span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-muted-foreground">Tickets Sold</span>
              <span className="text-sm">{giveaway.tickets_count ?? 0}</span>
            </div>
            {/* Donation split and earnings hidden from public view */}
          </div>

          <EnterGiveawayButton
            giveawayId={giveaway.id}
            ticketPrice={ticketPrice}
            title={giveaway.title ?? undefined}
          />

          {/* Donation widget */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <div className="rounded-lg p-6 border border-emerald-500/30 bg-emerald-500/10">
            <h3 className="text-lg font-semibold mb-3">Contribute to this giveaway</h3>
            <p className="text-xs text-muted-foreground mb-2">Your donation is split automatically into prize, creator, and platform shares.</p>
            {/* Client component for interactive donation */}
            {/* @ts-expect-error Server Component rendering Client Component */}
            <DonateWidget 
              giveawayId={giveaway.id}
              defaultSplit={{
                platform: Number(giveaway.donation_split_platform ?? 0),
                creator: Number(giveaway.donation_split_creator ?? 0),
                prize: Number(giveaway.donation_split_prize ?? 0),
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}