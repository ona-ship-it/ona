'use client'

import Image from 'next/image'
import Link from 'next/link'

/* ── SVG Icons (no emojis) ── */
const TicketIcon = ({ size = 12, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 9a3 3 0 013-3h14a3 3 0 013 3v0a3 3 0 01-3 3v0a3 3 0 013 3v0a3 3 0 01-3 3H5a3 3 0 01-3-3v0a3 3 0 013-3v0a3 3 0 01-3-3z"/>
  </svg>
)

const ClockIcon = ({ size = 9, color = '#22d3ee' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
)

const HeartIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
  </svg>
)

const BookmarkIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
  </svg>
)

const VerifiedIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24">
    <path fill="#067a0d" stroke="#0f1419" strokeWidth="2" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L18 10l-8 8z"/>
  </svg>
)

/* ── Types ── */
interface RaffleCardProps {
  id: string
  title: string
  description?: string
  image_url?: string
  prize_value: number
  total_tickets: number
  tickets_sold: number
  time_remaining: string
  photo_count?: number
  max_per_user?: number
  creator?: {
    full_name?: string
    avatar_url?: string
    subscriber_count?: number
  }
  is_verified?: boolean
}

/* ── Component ── */
export default function RaffleCard({
  id,
  title,
  description,
  image_url,
  prize_value,
  total_tickets,
  tickets_sold,
  time_remaining,
  photo_count = 1,
  max_per_user = 1100,
  creator,
  is_verified = false,
}: RaffleCardProps) {
  const pct = total_tickets > 0 ? Math.round((tickets_sold / total_tickets) * 100) : 0
  const odds = total_tickets > 0 ? (total_tickets - tickets_sold + 1).toLocaleString() : 'N/A'
  const displayPrice = prize_value?.toLocaleString() || '0'
  const creatorName = creator?.full_name || 'ONAGUI'
  const subsCount = creator?.subscriber_count || 0

  // Progress bar color class
  const progressClass = pct >= 80 ? 'high' : pct >= 50 ? 'mid' : 'low'

  return (
    <Link href={`/raffles/${id}`} className="raffle-card">
      {/* ── Image Section ── */}
      <div className="raffle-card-image-wrapper">
        {image_url ? (
          <Image
            src={image_url}
            alt={title}
            fill
            className="raffle-card-image"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="raffle-card-image-placeholder" />
        )}

        {/* Overlay */}
        <div className="raffle-card-overlay" />

        {/* Photo dots */}
        {photo_count > 1 && (
          <div className="raffle-photo-dots">
            {Array.from({ length: Math.min(photo_count, 5) }).map((_, i) => (
              <div
                key={i}
                className={`raffle-photo-dot ${i === 0 ? 'active' : 'inactive'}`}
              />
            ))}
          </div>
        )}

        {/* Raffle badge */}
        <div className="raffle-badge">
          <TicketIcon size={9} color="#fff" />
          <span>RAFFLE</span>
        </div>

        {/* Verified */}
        {is_verified && (
          <div className="raffle-verified">
            <VerifiedIcon />
          </div>
        )}

        {/* Time remaining */}
        <div className="raffle-time-badge">
          <ClockIcon />
          <span>{time_remaining}</span>
        </div>
      </div>

      {/* ── Card Body ── */}
      <div className="raffle-card-body">
        {/* Like & Save */}
        <div className="raffle-actions-row">
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            aria-label="Like"
          >
            <HeartIcon />
          </button>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            aria-label="Save"
          >
            <BookmarkIcon />
          </button>
        </div>

        {/* Creator + Title */}
        <div className="raffle-creator-row">
          <div className="raffle-creator-col">
            {creator?.avatar_url ? (
              <Image
                src={creator.avatar_url}
                alt={creatorName}
                width={28}
                height={28}
                className="raffle-creator-avatar"
              />
            ) : (
              <div className="raffle-creator-avatar-placeholder" />
            )}
            <span className="raffle-subs-badge">{subsCount} SUBS</span>
          </div>

          <div style={{ flex: 1 }}>
            <h3 className="raffle-card-title">{title}</h3>
            <div className="raffle-host">
              by <span className="raffle-host-name">{creatorName}</span>
            </div>
          </div>
        </div>

        {/* Price */}
        <div className="raffle-price">${displayPrice}</div>

        {/* Progress bar */}
        <div className="raffle-progress-wrapper">
          <div className="raffle-progress-labels">
            <span className="raffle-progress-sold">
              {tickets_sold.toLocaleString()} / {total_tickets.toLocaleString()} sold
            </span>
            <span className={`raffle-progress-pct ${progressClass}`}>
              {pct}%
            </span>
          </div>
          <div className="raffle-progress-bar">
            <div
              className={`raffle-progress-fill ${progressClass}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Odds */}
        <div className="raffle-odds">
          <span className="raffle-odds-label">Your odds</span>
          <span className="raffle-odds-value">1 in {odds}</span>
        </div>

        {/* Buy button */}
        <button
          className="raffle-buy-btn"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
        >
          <TicketIcon size={12} color="#fff" />
          BUY TICKET — 1 USDC
        </button>
        <div className="raffle-note">Max {max_per_user.toLocaleString()} per user</div>
      </div>
    </Link>
  )
}
