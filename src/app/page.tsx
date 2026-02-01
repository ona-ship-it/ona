'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/Header'

type Giveaway = {
  id: string
  title: string
  description: string
  emoji: string
  image_url: string | null
  prize_value: number
  prize_currency: string
  tickets_sold: number
  total_tickets: number
  ticket_price: number
  is_free: boolean
  status: string
  end_date: string
}

type Raffle = {
  id: string
  title: string
  emoji: string
  prize_value: number
  tickets_sold: number
  total_tickets: number
  base_ticket_price: number
  status: string
}

export default function HomePage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [giveaways, setGiveaways] = useState<Giveaway[]>([])
  const [raffles, setRaffles] = useState<Raffle[]>([])

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    try {
      // Fetch top 4 giveaways
      const { data: giveawaysData } = await supabase
        .from('giveaways')
        .select('*')
        .eq('status', 'active')
        .order('tickets_sold', { ascending: false })
        .limit(4)

      // Fetch top 4 raffles
      const { data: rafflesData } = await supabase
        .from('raffles')
        .select('*')
        .eq('status', 'active')
        .order('tickets_sold', { ascending: false })
        .limit(4)

      setGiveaways(giveawaysData || [])
      setRaffles(rafflesData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Mock data for marketplace (TODO: Remove when real data is ready)
  const mockMarketplace = [
    {
      id: '1',
      title: 'iPhone 15 Pro Max',
      price: 1299,
      image: 'https://images.unsplash.com/photo-1696446702403-69e5f8ab97ec?w=400',
      category: 'Electronics',
      seller: 'TechStore'
    },
    {
      id: '2',
      title: 'Sony PS5 Console',
      price: 499,
      image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400',
      category: 'Gaming',
      seller: 'GameHub'
    },
    {
      id: '3',
      title: 'MacBook Pro M3',
      price: 2499,
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',
      category: 'Computers',
      seller: 'AppleStore'
    },
    {
      id: '4',
      title: 'AirPods Pro 2',
      price: 249,
      image: 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=400',
      category: 'Audio',
      seller: 'AudioTech'
    }
  ]

  // Mock data for fundraise (TODO: Remove when real data is ready)
  const mockFundraise = [
    {
      id: '1',
      title: 'Help Build Clean Water Wells in Africa',
      raised: 45000,
      goal: 100000,
      image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400',
      category: 'Charity',
      donors: 1234
    },
    {
      id: '2',
      title: 'Support Local Animal Shelter',
      raised: 12500,
      goal: 25000,
      image: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=400',
      category: 'Animals',
      donors: 543
    },
    {
      id: '3',
      title: 'Medical Treatment for Children',
      raised: 67000,
      goal: 80000,
      image: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=400',
      category: 'Medical',
      donors: 2156
    },
    {
      id: '4',
      title: 'Education Fund for Underprivileged Kids',
      raised: 33000,
      goal: 50000,
      image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400',
      category: 'Education',
      donors: 876
    }
  ]

  const getProgressPercentage = (sold: number, total: number) => {
    return Math.min((sold / total) * 100, 100)
  }

  const getTimeRemaining = (endDate: string) => {
    const now = new Date().getTime()
    const end = new Date(endDate).getTime()
    const diff = end - now

    if (diff < 0) return 'Ended'

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

    if (days > 0) return `${days}d ${hours}h`
    return `${hours}h`
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--primary-bg)' }}>
      <Header />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* ROW 1: POPULAR GIVEAWAYS */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Popular Giveaways
            </h2>
            <Link 
              href="/giveaways" 
              className="text-sm font-medium hover:opacity-80 transition-opacity"
              style={{ color: 'var(--accent-blue)' }}
            >
              View More →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {giveaways.map((giveaway) => (
              <Link
                key={giveaway.id}
                href={`/giveaways/${giveaway.id}`}
                className="card group cursor-pointer"
              >
                {/* Image */}
                <div className="relative h-40 overflow-hidden rounded-t-lg" style={{ background: 'var(--tertiary-bg)' }}>
                  {giveaway.image_url ? (
                    <Image src={giveaway.image_url} alt={giveaway.title} fill className="object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-5xl">
                      {giveaway.emoji}
                    </div>
                  )}
                  
                  {/* Timer Badge */}
                  <div 
                    className="absolute top-2 right-2 px-2 py-1 rounded text-xs font-semibold"
                    style={{ background: 'rgba(11, 14, 17, 0.8)', color: 'var(--accent-red)' }}
                  >
                    {getTimeRemaining(giveaway.end_date)}
                  </div>

                  {/* Free/Paid Badge */}
                  {giveaway.is_free && (
                    <div 
                      className="absolute top-2 left-2 px-2 py-1 rounded text-xs font-semibold"
                      style={{ background: 'var(--accent-green)', color: 'var(--text-primary)' }}
                    >
                      FREE
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold mb-2 line-clamp-2 group-hover:opacity-80 transition-opacity text-sm" style={{ color: 'var(--text-primary)' }}>
                    {giveaway.title}
                  </h3>

                  {/* Prize Value */}
                  <div className="mb-3">
                    <div className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                      Prize Value
                    </div>
                    <div className="text-lg font-bold" style={{ color: 'var(--accent-green)' }}>
                      ${giveaway.prize_value.toLocaleString()}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                      <span>{getProgressPercentage(giveaway.tickets_sold, giveaway.total_tickets).toFixed(0)}%</span>
                      <span>{giveaway.tickets_sold} entries</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--tertiary-bg)' }}>
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${getProgressPercentage(giveaway.tickets_sold, giveaway.total_tickets)}%`,
                          background: 'var(--accent-blue)'
                        }}
                      />
                    </div>
                  </div>

                  {/* Enter Button */}
                  <button 
                    className="w-full py-2.5 rounded-md text-sm font-semibold transition-all"
                    style={{ 
                      background: giveaway.is_free ? 'var(--accent-green)' : 'var(--accent-blue)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    {giveaway.is_free ? 'Enter Free' : `${giveaway.ticket_price} USDC`}
                  </button>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ROW 2: POPULAR RAFFLES */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Popular Raffles
            </h2>
            <Link 
              href="/raffles" 
              className="text-sm font-medium hover:opacity-80 transition-opacity"
              style={{ color: 'var(--accent-blue)' }}
            >
              View More →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {raffles.map((raffle) => (
              <Link
                key={raffle.id}
                href={`/raffles/${raffle.id}`}
                className="card group cursor-pointer"
              >
                {/* Image */}
                <div className="relative h-40 overflow-hidden rounded-t-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                  <div className="text-6xl">{raffle.emoji}</div>
                  
                  {/* Sold Badge */}
                  <div 
                    className="absolute top-2 right-2 px-2 py-1 rounded text-xs font-semibold"
                    style={{ background: 'rgba(11, 14, 17, 0.8)', color: 'var(--accent-green)' }}
                  >
                    {raffle.tickets_sold}/{raffle.total_tickets}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold mb-2 line-clamp-2 group-hover:opacity-80 transition-opacity text-sm" style={{ color: 'var(--text-primary)' }}>
                    {raffle.title}
                  </h3>

                  {/* Prize Value */}
                  <div className="mb-3">
                    <div className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                      Prize Value
                    </div>
                    <div className="text-lg font-bold" style={{ color: 'var(--accent-green)' }}>
                      ${raffle.prize_value.toLocaleString()}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                      <span>{getProgressPercentage(raffle.tickets_sold, raffle.total_tickets).toFixed(0)}% sold</span>
                      <span>{raffle.tickets_sold} tickets</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--tertiary-bg)' }}>
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${getProgressPercentage(raffle.tickets_sold, raffle.total_tickets)}%`,
                          background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'
                        }}
                      />
                    </div>
                  </div>

                  {/* Buy Button */}
                  <button 
                    className="w-full py-2.5 rounded-md text-sm font-semibold transition-all"
                    style={{ 
                      background: 'var(--accent-blue)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    ${raffle.base_ticket_price}/ticket
                  </button>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ROW 3: MARKETPLACE (MOCK DATA - TODO: REMOVE) */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Marketplace
            </h2>
            <Link 
              href="/marketplace" 
              className="text-sm font-medium hover:opacity-80 transition-opacity"
              style={{ color: 'var(--accent-blue)' }}
            >
              View More →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {mockMarketplace.map((item) => (
              <Link
                key={item.id}
                href={`/marketplace/${item.id}`}
                className="card group cursor-pointer"
              >
                {/* Image */}
                <div className="relative h-40 overflow-hidden rounded-t-lg" style={{ background: 'var(--tertiary-bg)' }}>
                  <Image src={item.image} alt={item.title} fill className="object-cover" />
                  
                  {/* Category Badge */}
                  <div 
                    className="absolute top-2 left-2 px-2 py-1 rounded text-xs font-semibold"
                    style={{ background: 'rgba(11, 14, 17, 0.8)', color: 'var(--accent-orange)' }}
                  >
                    {item.category}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold mb-2 line-clamp-2 group-hover:opacity-80 transition-opacity text-sm" style={{ color: 'var(--text-primary)' }}>
                    {item.title}
                  </h3>

                  {/* Price */}
                  <div className="mb-3">
                    <div className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                      Price
                    </div>
                    <div className="text-lg font-bold" style={{ color: 'var(--accent-green)' }}>
                      ${item.price.toLocaleString()}
                    </div>
                  </div>

                  {/* Seller */}
                  <div className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
                    by {item.seller}
                  </div>

                  {/* Buy Button */}
                  <button 
                    className="w-full py-2.5 rounded-md text-sm font-semibold transition-all"
                    style={{ 
                      background: 'var(--accent-blue)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    Buy Now
                  </button>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ROW 4: FUNDRAISE (MOCK DATA - TODO: REMOVE) */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Fundraising Campaigns
            </h2>
            <Link 
              href="/fundraise" 
              className="text-sm font-medium hover:opacity-80 transition-opacity"
              style={{ color: 'var(--accent-blue)' }}
            >
              View More →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {mockFundraise.map((campaign) => (
              <Link
                key={campaign.id}
                href={`/fundraise/${campaign.id}`}
                className="card group cursor-pointer"
              >
                {/* Image */}
                <div className="relative h-40 overflow-hidden rounded-t-lg" style={{ background: 'var(--tertiary-bg)' }}>
                  <Image src={campaign.image} alt={campaign.title} fill className="object-cover" />
                  
                  {/* Category Badge */}
                  <div 
                    className="absolute top-2 left-2 px-2 py-1 rounded text-xs font-semibold"
                    style={{ background: 'rgba(11, 14, 17, 0.8)', color: 'var(--accent-green)' }}
                  >
                    {campaign.category}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold mb-2 line-clamp-2 group-hover:opacity-80 transition-opacity text-sm" style={{ color: 'var(--text-primary)' }}>
                    {campaign.title}
                  </h3>

                  {/* Raised Amount */}
                  <div className="mb-3">
                    <div className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                      Raised
                    </div>
                    <div className="text-lg font-bold" style={{ color: 'var(--accent-green)' }}>
                      ${campaign.raised.toLocaleString()}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                      <span>{Math.round((campaign.raised / campaign.goal) * 100)}%</span>
                      <span>{campaign.donors} donors</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--tertiary-bg)' }}>
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${(campaign.raised / campaign.goal) * 100}%`,
                          background: 'var(--accent-green)'
                        }}
                      />
                    </div>
                  </div>

                  {/* Donate Button */}
                  <button 
                    className="w-full py-2.5 rounded-md text-sm font-semibold transition-all"
                    style={{ 
                      background: 'var(--accent-green)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    Donate Now
                  </button>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
