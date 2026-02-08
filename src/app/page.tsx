'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { createClient } from '@/lib/supabase'

type Giveaway = {
  id: string
  title: string
  image_url: string | null
  prize_value: number
  tickets_sold: number
  end_date: string
  is_free: boolean
  ticket_price: number
}

type Raffle = {
  id: string
  title: string
  prize_value: number
  tickets_sold: number
  base_ticket_price: number
}

export default function Home() {
  const supabase = createClient()
  const [activeTab, setActiveTab] = useState('all')
  const [giveaways, setGiveaways] = useState<Giveaway[]>([])
  const [raffles, setRaffles] = useState<Raffle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const [giveawaysRes, rafflesRes] = await Promise.all([
        supabase
          .from('giveaways')
          .select('*')
          .eq('status', 'active')
          .order('tickets_sold', { ascending: false })
          .limit(20),
        supabase
          .from('raffles')
          .select('*')
          .eq('status', 'active')
          .order('tickets_sold', { ascending: false })
          .limit(20)
      ])

      setGiveaways(giveawaysRes.data || [])
      setRaffles(rafflesRes.data || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    } 
  }

  const getTimeRemaining = (endDate: string) => {
    const end = new Date(endDate).getTime()
    const now = new Date().getTime()
    const diff = end - now
    
    if (diff <= 0) return 'Ended'
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    if (days > 0) return `${days}d ${hours}h`
    return `${hours}h`
  }

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'giveaways', label: 'Giveaways' },
    { id: 'raffles', label: 'Raffles' },
    { id: 'marketplace', label: 'Marketplace' },
    { id: 'fundraise', label: 'Fundraise' }
  ]

  const defaultImage = 'https://images.unsplash.com/photo-1696446702403-69e5f8ab97ec?w=800&h=500&fit=crop'

  const getFilteredItems = () => {
    if (activeTab === 'giveaways') {
      return giveaways.map(g => ({
        id: g.id,
        type: 'giveaway' as const,
        title: g.title,
        image: g.image_url || defaultImage,
        href: `/giveaways/${g.id}`,
        prize: g.prize_value.toString(),
        entries: g.tickets_sold,
        timeLeft: getTimeRemaining(g.end_date),
        hot: g.tickets_sold > 10000,
        verified: true,
        actionLabel: g.is_free ? 'Enter Free' : `${g.ticket_price} USDC`
      }))
    }
    
    if (activeTab === 'raffles') {
      return raffles.map(r => ({
        id: r.id,
        type: 'raffle' as const,
        title: r.title,
        image: defaultImage,
        href: `/raffles/${r.id}`,
        prize: r.prize_value.toString(),
        entries: r.tickets_sold,
        hot: r.tickets_sold > 5000,
        verified: true,
        actionLabel: `$${r.base_ticket_price}/ticket`
      }))
    }
    
    // For 'all', combine both
    const allGiveaways = giveaways.slice(0, 10).map(g => ({
      id: g.id,
      type: 'giveaway' as const,
      title: g.title,
      image: g.image_url || defaultImage,
      href: `/giveaways/${g.id}`,
      prize: g.prize_value.toString(),
      entries: g.tickets_sold,
      timeLeft: getTimeRemaining(g.end_date),
      hot: g.tickets_sold > 10000,
      verified: true,
      actionLabel: g.is_free ? 'Enter Free' : `${g.ticket_price} USDC`
    }))
    
    const allRaffles = raffles.slice(0, 10).map(r => ({
      id: r.id,
      type: 'raffle' as const,
      title: r.title,
      image: defaultImage,
      href: `/raffles/${r.id}`,
      prize: r.prize_value.toString(),
      entries: r.tickets_sold,
      hot: r.tickets_sold > 5000,
      verified: true,
      actionLabel: `$${r.base_ticket_price}/ticket`
    }))
    
    return [...allGiveaways, ...allRaffles].sort(() => Math.random() - 0.5)
  }

  return (
    <>
      {/* Search Bar - Mobile Only */}
      <div className="p-4 md:hidden">
        <input 
          type="search" 
          placeholder="Search giveaways, raffles..." 
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-light)',
            borderRadius: '0.75rem',
            fontSize: '0.875rem',
          }}
        />
      </div>

      {/* Tabs */}
      <div className="tabs-wrapper">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Cards Grid */}
      <div className="container">
        {loading ? (
          <div style={{
            padding: '3rem',
            textAlign: 'center',
            color: 'var(--text-secondary)'
          }}>
            Loading...
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 p-4" style={{
            gridTemplateColumns: 'repeat(1, 1fr)'
          }}>
            {activeTab === 'marketplace' && (
              <div style={{
                padding: '3rem 1rem',
                textAlign: 'center',
                color: 'var(--text-secondary)'
              }}>
                Marketplace coming soon...
              </div>
            )}
            
            {activeTab === 'fundraise' && (
              <div style={{
                padding: '3rem 1rem',
                textAlign: 'center',
                color: 'var(--text-secondary)'
              }}>
                Fundraise campaigns coming soon...
              </div>
            )}
            
            {activeTab !== 'marketplace' && activeTab !== 'fundraise' && getFilteredItems().map(item => (
              <Card key={item.id} {...item} />
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        @media (min-width: 768px) {
          .grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        
        @media (min-width: 1024px) {
          .grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }
      `}</style>
    </>
  )
}
