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
  status: string
}

export default function GiveawaysPage() {
  const supabase = createClient()
  const [activeTab, setActiveTab] = useState('active')
  const [giveaways, setGiveaways] = useState<Giveaway[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGiveaways()
  }, [activeTab])

  async function fetchGiveaways() {
    setLoading(true)
    try {
      let query = supabase
        .from('giveaways')
        .select('*')
        .order('created_at', { ascending: false })

      if (activeTab === 'active') {
        query = query.eq('status', 'active')
      } else if (activeTab === 'ended') {
        query = query.in('status', ['completed', 'drawn'])
      }

      const { data } = await query.limit(50)
      setGiveaways(data || [])
    } catch (error) {
      console.error('Error fetching giveaways:', error)
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
    { id: 'active', label: 'Active' },
    { id: 'ended', label: 'Ended' },
    { id: 'free', label: 'Free Entry' },
  ]

  const defaultImage = 'https://images.unsplash.com/photo-1696446702403-69e5f8ab97ec?w=800&h=500&fit=crop'

  return (
    <>
      {/* Page Header */}
      <div style={{
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-light)',
        padding: '1.5rem 1.25rem',
      }}>
        <h1 style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: '0.25rem',
        }}>
          Giveaways
        </h1>
        <p style={{
          fontSize: '0.875rem',
          color: 'var(--text-secondary)',
        }}>
          Enter to win amazing prizes
        </p>
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
        ) : giveaways.length === 0 ? (
          <div style={{
            padding: '3rem 1rem',
            textAlign: 'center',
            color: 'var(--text-secondary)'
          }}>
            No giveaways found
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 p-4">
            {giveaways.map(giveaway => (
              <Card
                key={giveaway.id}
                id={giveaway.id}
                type="giveaway"
                title={giveaway.title}
                image={giveaway.image_url || defaultImage}
                href={`/giveaways/${giveaway.id}`}
                prize={giveaway.prize_value.toString()}
                entries={giveaway.tickets_sold}
                timeLeft={getTimeRemaining(giveaway.end_date)}
                hot={giveaway.tickets_sold > 10000}
                verified={true}
                actionLabel={giveaway.is_free ? 'Enter Free' : `${giveaway.ticket_price} USDC`}
              />
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
