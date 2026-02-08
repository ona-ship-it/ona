'use client'

import React from 'react'
import Link from 'next/link'
import { Check, Flame } from 'lucide-react'

interface CardProps {
  id: string
  type?: 'giveaway' | 'raffle' | 'marketplace' | 'fundraise'
  title: string
  image: string
  href: string
  prize?: string
  entries?: number
  timeLeft?: string
  hot?: boolean
  verified?: boolean
  actionLabel?: string
}

export const Card: React.FC<CardProps> = ({
  title,
  image,
  href,
  prize,
  entries,
  timeLeft,
  hot,
  verified,
  actionLabel = 'Enter Now',
}) => {
  return (
    <Link
      href={href}
      style={{
        display: 'block',
        background: 'var(--bg-primary)',
        border: '1px solid var(--border-light)',
        borderRadius: '1rem',
        overflow: 'hidden',
        textDecoration: 'none',
        transition: 'all 0.2s ease',
      }}
      className="card-link"
    >
      {/* Image */}
      <div style={{
        position: 'relative',
        width: '100%',
        paddingBottom: '60%',
        background: 'var(--bg-tertiary)',
        overflow: 'hidden',
      }}>
        <img
          src={image}
          alt={title}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
        
        {/* Hot Badge */}
        {hot && (
          <div style={{
            position: 'absolute',
            top: '0.75rem',
            right: '0.75rem',
            background: 'var(--hot)',
            color: '#ffffff',
            padding: '0.375rem 0.625rem',
            borderRadius: '0.5rem',
            fontSize: '0.75rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
          }}>
            <Flame size={12} fill="currentColor" />
            HOT
          </div>
        )}
        
        {/* Time Left */}
        {timeLeft && (
          <div style={{
            position: 'absolute',
            bottom: '0.75rem',
            left: '0.75rem',
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            color: '#ffffff',
            padding: '0.375rem 0.75rem',
            borderRadius: '0.5rem',
            fontSize: '0.75rem',
            fontWeight: 600,
          }}>
            {timeLeft}
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '1rem' }}>
        {/* Title */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '0.75rem',
        }}>
          <h3 style={{
            fontSize: '0.9375rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            margin: 0,
            lineHeight: 1.3,
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}>
            {title}
          </h3>
          {verified && (
            <div style={{
              width: '1rem',
              height: '1rem',
              background: 'var(--primary)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Check size={10} strokeWidth={3} color="#ffffff" />
            </div>
          )}
        </div>

        {/* Stats */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.75rem',
        }}>
          {prize && (
            <div>
              <div style={{
                fontSize: '0.6875rem',
                color: 'var(--text-tertiary)',
                marginBottom: '0.125rem',
              }}>
                Prize Value
              </div>
              <div style={{
                fontSize: '1rem',
                fontWeight: 700,
                color: 'var(--primary)',
              }}>
                ${prize}
              </div>
            </div>
          )}
          
          {entries !== undefined && (
            <div style={{ textAlign: 'right' }}>
              <div style={{
                fontSize: '0.6875rem',
                color: 'var(--text-tertiary)',
                marginBottom: '0.125rem',
              }}>
                Entries
              </div>
              <div style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
              }}>
                {entries.toLocaleString()}
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <button
          style={{
            width: '100%',
            padding: '0.75rem',
            background: 'var(--primary)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '0.75rem',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            minHeight: '44px',
          }}
          className="card-button"
        >
          {actionLabel}
        </button>
      </div>

      <style jsx>{`
        .card-link:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }
        
        .card-button:hover {
          background: #00b8b8;
        }
      `}</style>
    </Link>
  )
}
