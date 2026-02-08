'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { createClient } from '@/lib/supabase'

type Raffle = {
  id: string
  title: string
  prize_value: number
  tickets_sold: number
  total_tickets: number
  base_ticket_price: number
  status: string
}

export default function RafflesPage() {
  const supabase = createClient()
  const [activeTab, setActiveTab] = useState('active')
  const [raffles, setRaffles] = useState<Raffle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRaffles()
  }, [activeTab])

  async function fetchRaffles() {
    setLoading(true)
    try {
      let query = supabase
        .from('raffles')
        .select('*')
        .order('created_at', { ascending: false })

      if (activeTab === 'active') {
        query = query.eq('status', 'active')
      } else if (activeTab === 'ended') {
        query = query.in('status', ['completed', 'sold_out'])
      }

      const { data } = await query.limit(50)
      setRaffles(data || [])
    } catch (error) {
      console.error('Error fetching raffles:', error)
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'active', label: 'Active' },
    { id: 'ended', label: 'Ended' },
    { id: 'trending', label: 'Trending' },
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
          Raffles
        </h1>
        <p style={{
          fontSize: '0.875rem',
          color: 'var(--text-secondary)',
        }}>
          Buy tickets and win big prizes
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
        ) : raffles.length === 0 ? (
          <div style={{
            padding: '3rem 1rem',
            textAlign: 'center',
            color: 'var(--text-secondary)'
          }}>
            No raffles found
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 p-4">
            {raffles.map(raffle => (
              <Card
                key={raffle.id}
                id={raffle.id}
                type="raffle"
                title={raffle.title}
                image={defaultImage}
                href={`/raffles/${raffle.id}`}
                prize={raffle.prize_value.toString()}
                entries={raffle.tickets_sold}
                hot={raffle.tickets_sold > 5000}
                verified={true}
                actionLabel={`$${raffle.base_ticket_price}/ticket`}
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
