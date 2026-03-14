'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import LikeSaveButtons from '@/components/LikeSaveButtons'
import WalletConnect from '@/components/WalletConnect'
import { payWithUSDC, isOnPolygon } from '@/lib/wallet'

type Fundraiser = {
  id: string
  title: string
  description: string | null
  cover_image: string | null
  category: string | null
  goal_amount: number
  raised_amount: number
  currency: string
  total_donors: number
  status: string
  created_at: string | null
  end_date: string | null
  creator_id: string | null
}

type Creator = {
  id: string
  full_name: string | null
  avatar_url: string | null
  username: string | null
}

const FALLBACK_IMG = 'https://placehold.co/800x400/1a1f2e/00ff88?text=Campaign'
const AVATAR_FALLBACK = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop'

export default function FundraiseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [fundraiser, setFundraiser] = useState<Fundraiser | null>(null)
  const [creator, setCreator] = useState<Creator | null>(null)
  const [user, setUser] = useState<any>(null)
  const [donating, setDonating] = useState(false)
  const [donationAmount, setDonationAmount] = useState('5')
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    fetchFundraiser()
    checkAuth()
  }, [params.id])

  async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) setUser(session.user)
  }

  async function fetchFundraiser() {
    try {
      const { data, error } = await supabase
        .from('fundraisers')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error || !data) {
        router.push('/fundraise')
        return
      }

      setFundraiser(data)

      if (data.creator_id) {
        const { data: creatorData } = await supabase
          .from('onagui_profiles')
          .select('id, full_name, avatar_url, username')
          .eq('id', data.creator_id)
          .maybeSingle()
        setCreator(creatorData || null)
      }
    } catch (err) {
      console.error('Error fetching fundraiser:', err)
      router.push('/fundraise')
    } finally {
      setLoading(false)
    }
  }

  async function handleDonate() {
    if (!user) {
      router.push('/login')
      return
    }

    const amount = parseFloat(donationAmount)
    if (!amount || amount <= 0) {
      alert('Please enter a valid donation amount')
      return
    }

    if (!walletAddress) {
      alert('Please connect your wallet first')
      return
    }

    const onPolygon = await isOnPolygon()
    if (!onPolygon) {
      alert('Please switch to Polygon network')
      return
    }

    setDonating(true)
    try {
      const paymentResult = await payWithUSDC(amount)
      if (!paymentResult.success) {
        throw new Error(paymentResult.error || 'Payment failed')
      }

      // Record donation in database
      await supabase.from('donations').insert({
        fundraiser_id: fundraiser!.id,
        donor_id: user.id,
        amount,
        currency: 'USDC',
        payment_method: 'crypto',
        transaction_hash: paymentResult.txHash || null,
        status: 'completed',
      })

      // Update fundraiser totals
      await supabase
        .from('fundraisers')
        .update({
          raised_amount: (fundraiser!.raised_amount || 0) + amount,
          total_donors: (fundraiser!.total_donors || 0) + 1,
        })
        .eq('id', fundraiser!.id)

      setSuccessMsg(`Thank you for donating $${amount} USDC!`)
      await fetchFundraiser()
    } catch (err: any) {
      console.error('Donation error:', err)
      alert(`Donation failed: ${err.message || 'Unknown error'}`)
    } finally {
      setDonating(false)
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0A0E13', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="animate-spin" style={{ width: 64, height: 64, borderRadius: '50%', border: '3px solid transparent', borderTop: '3px solid #00d4d4' }} />
      </div>
    )
  }

  if (!fundraiser) return null

  const progress = fundraiser.goal_amount > 0
    ? Math.min((fundraiser.raised_amount / fundraiser.goal_amount) * 100, 100)
    : 0
  const currency = fundraiser.currency === 'USD' ? '$' : fundraiser.currency

  return (
    <div style={{ minHeight: '100vh', background: '#0A0E13' }}>
      {/* Back nav */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '12px 16px' }}>
        <Link href="/fundraise" style={{ color: '#60a5fa', fontWeight: 600, textDecoration: 'none' }}>
          ← Back to Campaigns
        </Link>
      </div>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 16px 48px' }}>
        <div className="giveaway-detail-grid" style={{ display: 'grid', gap: 32 }}>
          {/* Left — Image & Description */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Cover Image */}
            <div style={{ borderRadius: 24, overflow: 'hidden', border: '2px solid #1e293b', position: 'relative', height: 384, background: '#0f172a' }}>
              <Image
                src={fundraiser.cover_image || FALLBACK_IMG}
                alt={fundraiser.title}
                fill
                style={{ objectFit: 'cover' }}
              />
            </div>

            {/* Creator & Description */}
            <div style={{ background: 'rgba(15,23,42,0.5)', border: '2px solid #1e293b', borderRadius: 24, padding: 32 }}>
              {creator && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <Image
                    src={creator.avatar_url || AVATAR_FALLBACK}
                    alt={creator.full_name || 'Creator'}
                    width={40}
                    height={40}
                    style={{ borderRadius: '50%' }}
                  />
                  <div>
                    <div style={{ color: '#94a3b8', fontSize: 13 }}>Organized by</div>
                    <div style={{ color: '#fff', fontWeight: 600 }}>{creator.full_name || creator.username || 'ONAGUI User'}</div>
                  </div>
                </div>
              )}
              <h1 style={{ fontSize: 32, fontWeight: 800, color: '#fff', marginBottom: 16 }}>{fundraiser.title}</h1>
              {fundraiser.category && (
                <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 999, background: 'rgba(0,255,136,0.1)', color: '#00ff88', fontSize: 12, fontWeight: 600, marginBottom: 16 }}>
                  {fundraiser.category}
                </span>
              )}
              <p style={{ color: '#cbd5e1', fontSize: 16, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                {fundraiser.description || 'No description provided.'}
              </p>
            </div>

            {/* Like/Save */}
            <div onClick={e => e.stopPropagation()}>
              <LikeSaveButtons postId={fundraiser.id} postType="fundraiser" size="md" />
            </div>
          </div>

          {/* Right — Donation Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Progress Card */}
            <div style={{ background: 'linear-gradient(to bottom right, rgba(6,78,59,0.3), rgba(4,120,87,0.3))', border: '2px solid rgba(0,255,136,0.3)', borderRadius: 24, padding: 24 }}>
              <div style={{ color: '#4ade80', fontSize: 13, marginBottom: 8 }}>Raised</div>
              <div style={{ fontSize: 36, fontWeight: 800, color: '#fff', marginBottom: 4 }}>
                {currency}{fundraiser.raised_amount.toLocaleString()}
              </div>
              <div style={{ color: '#4ade80', fontWeight: 600, marginBottom: 16 }}>
                of {currency}{fundraiser.goal_amount.toLocaleString()} goal
              </div>

              {/* Progress bar */}
              <div style={{ height: 10, borderRadius: 999, background: 'rgba(255,255,255,0.1)', marginBottom: 12 }}>
                <div style={{ height: '100%', borderRadius: 999, background: '#00ff88', width: `${progress}%`, transition: 'width 0.5s' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#94a3b8' }}>
                <span>{Math.round(progress)}% funded</span>
                <span>{fundraiser.total_donors} donors</span>
              </div>
            </div>

            {/* Donation Form */}
            <div style={{ background: 'rgba(15,23,42,0.5)', border: '2px solid #1e293b', borderRadius: 24, padding: 24 }}>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 16 }}>Make a Donation</h3>

              {successMsg && (
                <div style={{ padding: 12, marginBottom: 16, borderRadius: 12, background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.3)', color: '#4ade80', fontSize: 14 }}>
                  {successMsg}
                </div>
              )}

              {/* Quick amounts */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16 }}>
                {['5', '10', '25', '50', '100', '250'].map(amt => (
                  <button
                    key={amt}
                    onClick={() => setDonationAmount(amt)}
                    style={{
                      padding: '12px 0',
                      borderRadius: 12,
                      fontWeight: 700,
                      fontSize: 15,
                      border: donationAmount === amt ? '2px solid #00d4d4' : '2px solid #334155',
                      background: donationAmount === amt ? 'rgba(0,212,212,0.1)' : 'transparent',
                      color: donationAmount === amt ? '#00d4d4' : '#94a3b8',
                      cursor: 'pointer',
                    }}
                  >
                    ${amt}
                  </button>
                ))}
              </div>

              {/* Custom amount */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, color: '#94a3b8', marginBottom: 6 }}>Custom amount (USDC)</label>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={donationAmount}
                  onChange={e => setDonationAmount(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: 12,
                    background: 'rgba(15,20,25,0.8)',
                    border: '1px solid #334155',
                    color: '#fff',
                    fontSize: 16,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Wallet connect */}
              <div style={{ marginBottom: 16 }}>
                <WalletConnect onConnect={setWalletAddress} />
              </div>

              {/* Donate button */}
              <button
                onClick={handleDonate}
                disabled={donating || fundraiser.status !== 'active' || !walletAddress}
                style={{
                  width: '100%',
                  padding: '16px 0',
                  borderRadius: 12,
                  fontWeight: 700,
                  fontSize: 18,
                  border: 'none',
                  cursor: donating || !walletAddress ? 'not-allowed' : 'pointer',
                  background: donating || !walletAddress ? '#334155' : '#00ff88',
                  color: donating || !walletAddress ? '#94a3b8' : '#0A0E13',
                  transition: 'all 0.2s',
                }}
              >
                {donating ? 'Processing...' : `Donate $${donationAmount || '0'} USDC`}
              </button>

              {!user && (
                <p style={{ textAlign: 'center', fontSize: 13, color: '#94a3b8', marginTop: 12 }}>
                  <Link href="/login" style={{ color: '#60a5fa' }}>Sign in</Link> to donate
                </p>
              )}
            </div>

            {/* Campaign info */}
            <div style={{ background: 'rgba(15,23,42,0.5)', border: '2px solid #1e293b', borderRadius: 24, padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ color: '#94a3b8', fontSize: 14 }}>Status</span>
                <span style={{ color: fundraiser.status === 'active' ? '#4ade80' : '#f87171', fontWeight: 600, fontSize: 14, textTransform: 'capitalize' }}>{fundraiser.status}</span>
              </div>
              {fundraiser.end_date && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8', fontSize: 14 }}>End Date</span>
                  <span style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>{new Date(fundraiser.end_date).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
