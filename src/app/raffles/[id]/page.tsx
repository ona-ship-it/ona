import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase'
import RaffleDetailClient from './RaffleDetailClient'

// This runs on the server — X/Twitter/Facebook bots will see these tags
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const supabase = createClient()

  const { data: raffle } = await supabase
    .from('raffles')
    .select('title, description, image_urls, prize_value, prize_currency, total_tickets, tickets_sold')
    .eq('id', params.id)
    .single()

  if (!raffle) {
    return {
      title: 'Raffle Not Found | Onagui',
      description: 'This raffle does not exist or has been removed.',
    }
  }

  const image = raffle.image_urls?.[0] || 'https://www.onagui.com/og-default.png'
  const title = raffle.title || 'Raffle on Onagui'
  const description = raffle.description
    || `Win ${raffle.title} worth $${raffle.prize_value?.toLocaleString()} ${raffle.prize_currency || 'USD'} — ${raffle.total_tickets - raffle.tickets_sold} tickets left!`

  return {
    title: `${title} | Onagui`,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type: 'website',
      siteName: 'Onagui',
      url: `https://www.onagui.com/raffles/${params.id}`,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
      site: '@onaborado',
    },
  }
}

export default function RaffleDetailPage() {
  return <RaffleDetailClient />
}
