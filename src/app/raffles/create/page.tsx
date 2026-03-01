'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

/* ── SVG Icons ── */
const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
)
const UploadIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
)
const XIcon = () => (
  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
)
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
)
const LinkIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
)
const ShieldIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24"><path fill="#067a0d" d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm-2 16l-4-4 1.41-1.41L10 15.17l6.59-6.59L18 10l-8 8z"/></svg>
)

/* ── Styles ── */
const styles = {
  page: { background: '#0a1929', minHeight: '100vh', padding: '24px 16px', fontFamily: "'Inter', system-ui, sans-serif" } as React.CSSProperties,
  container: { maxWidth: 600, margin: '0 auto' } as React.CSSProperties,
  title: { fontSize: 24, fontWeight: 800, color: '#f8fafc', marginBottom: 4, fontFamily: "'Rajdhani', sans-serif" } as React.CSSProperties,
  subtitle: { fontSize: 13, color: '#94a3b8', marginBottom: 24 } as React.CSSProperties,
  card: { background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 20, marginBottom: 16 } as React.CSSProperties,
  cardTitle: { fontSize: 18, fontWeight: 700, color: '#f8fafc', margin: '0 0 4px' } as React.CSSProperties,
  cardSub: { fontSize: 11, color: '#94a3b8', margin: '0 0 18px' } as React.CSSProperties,
  label: { fontSize: 11, fontWeight: 500, color: '#94a3b8', marginBottom: 6, display: 'block' } as React.CSSProperties,
  input: { width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)', background: '#0f1419', color: '#f8fafc', fontSize: 13, outline: 'none', boxSizing: 'border-box' as const, marginBottom: 14 } as React.CSSProperties,
  textarea: { width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)', background: '#0f1419', color: '#f8fafc', fontSize: 13, outline: 'none', boxSizing: 'border-box' as const, resize: 'none' as const, height: 80, marginBottom: 14 } as React.CSSProperties,
  select: { width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)', background: '#0f1419', color: '#f8fafc', fontSize: 13, outline: 'none', boxSizing: 'border-box' as const, marginBottom: 14 } as React.CSSProperties,
  infoBox: { background: 'rgba(6,122,13,0.08)', border: '1px solid rgba(6,122,13,0.2)', borderRadius: 10, padding: 14, marginTop: 8 } as React.CSSProperties,
  infoLabel: { fontSize: 10, fontWeight: 600, color: '#067a0d', marginBottom: 10, textTransform: 'uppercase' as const, letterSpacing: 0.5 } as React.CSSProperties,
  infoRow: { display: 'flex', justifyContent: 'space-between', marginBottom: 8 } as React.CSSProperties,
  infoKey: { fontSize: 11, color: '#94a3b8' } as React.CSSProperties,
  infoVal: { fontSize: 13, fontWeight: 700, color: '#f8fafc' } as React.CSSProperties,
  infoValGreen: { fontSize: 13, fontWeight: 700, color: '#067a0d' } as React.CSSProperties,
  btnRow: { display: 'flex', gap: 10, marginTop: 8 } as React.CSSProperties,
  btnBack: { flex: 1, padding: 12, border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, background: 'transparent', color: '#f8fafc', fontSize: 13, fontWeight: 600, cursor: 'pointer' } as React.CSSProperties,
  btnNext: { flex: 1, padding: 12, border: 'none', borderRadius: 10, background: 'linear-gradient(135deg, #2be937, #067a0d)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' } as React.CSSProperties,
  stepRow: { display: 'flex', alignItems: 'center', gap: 3, marginBottom: 8 } as React.CSSProperties,
  stepLabels: { display: 'flex', justifyContent: 'space-between', marginBottom: 24 } as React.CSSProperties,
  photoGrid: { display: 'flex', gap: 8, flexWrap: 'wrap' as const, marginBottom: 18 } as React.CSSProperties,
  photoThumb: { width: 68, height: 68, borderRadius: 10, background: 'linear-gradient(135deg,#0f2027,#203a43)', border: '1px solid rgba(255,255,255,0.08)', position: 'relative' as const, display: 'flex', alignItems: 'center', justifyContent: 'center' } as React.CSSProperties,
  photoRemove: { position: 'absolute' as const, top: -5, right: -5, width: 18, height: 18, borderRadius: '50%', background: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '2px solid #0a1929' } as React.CSSProperties,
  photoCover: { position: 'absolute' as const, bottom: 3, left: 0, right: 0, textAlign: 'center' as const, fontSize: 7, fontWeight: 700, color: '#067a0d' } as React.CSSProperties,
  photoAdd: { width: 68, height: 68, borderRadius: 10, border: '2px dashed rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', cursor: 'pointer', gap: 2 } as React.CSSProperties,
  toggleRow: { background: '#0f1419', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: 14, marginBottom: 14 } as React.CSSProperties,
  toggleHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 } as React.CSSProperties,
  toggleOn: { width: 36, height: 20, borderRadius: 10, background: '#067a0d', padding: 2, cursor: 'pointer' } as React.CSSProperties,
  toggleOff: { width: 36, height: 20, borderRadius: 10, background: '#334155', padding: 2, cursor: 'pointer' } as React.CSSProperties,
  toggleDot: { width: 16, height: 16, borderRadius: 8, background: '#fff', transition: 'margin-left 0.2s' } as React.CSSProperties,
  reviewRow: { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.08)' } as React.CSSProperties,
  reviewKey: { fontSize: 11, color: '#94a3b8' } as React.CSSProperties,
  reviewVal: { fontSize: 12, fontWeight: 600, color: '#f8fafc' } as React.CSSProperties,
  termsBox: { background: 'rgba(6,122,13,0.08)', border: '1px solid rgba(6,122,13,0.2)', borderRadius: 10, padding: 12, marginTop: 16, fontSize: 10, color: '#94a3b8', display: 'flex', alignItems: 'flex-start', gap: 8 } as React.CSSProperties,
}

const STEPS = ['Details', 'Prize Info', 'Tickets', 'Duration', 'Review']
const CATEGORIES = ['vehicle', 'electronics', 'cash', 'luxury', 'real_estate', 'other']
const CATEGORY_LABELS: Record<string, string> = { vehicle: 'Vehicle', electronics: 'Electronics', cash: 'Cash (USDC)', luxury: 'Luxury Goods', real_estate: 'Real Estate', other: 'Other' }

export default function CreateRafflePage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Form state
  const [photos, setPhotos] = useState<string[]>([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('vehicle')
  const [prizeValue, setPrizeValue] = useState('')
  const [proofUrl, setProofUrl] = useState('')
  const [totalTickets, setTotalTickets] = useState('')
  const [maxPerUser, setMaxPerUser] = useState('')
  const [referralEnabled, setReferralEnabled] = useState(false)
  const [referralRate, setReferralRate] = useState('2')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // Calculations
  const prizeNum = parseFloat(prizeValue.replace(/,/g, '')) || 0
  const minTickets = Math.ceil(prizeNum * 1.1)
  const ticketsNum = parseInt(totalTickets.replace(/,/g, '')) || minTickets
  const maxPerUserNum = parseInt(maxPerUser.replace(/,/g, '')) || Math.max(1, Math.floor(ticketsNum * 0.01))
  const maxRevenue = ticketsNum * 1
  const refRate = parseFloat(referralRate) || 0

  // Duration calc
  const durationDays = startDate && endDate
    ? Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))
    : 0

  // Photo upload simulation (in production, upload to Supabase Storage)
  const handleAddPhoto = () => {
    if (photos.length < 10) {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.onchange = (e: any) => {
        const file = e.target.files?.[0]
        if (file) {
          const url = URL.createObjectURL(file)
          setPhotos(prev => [...prev, url])
        }
      }
      input.click()
    }
  }

  const removePhoto = (idx: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== idx))
  }

  // Submit
  const handlePublish = async () => {
    setLoading(true)
    setError('')

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setError('You must be signed in to create a raffle')
        setLoading(false)
        return
      }

      const { data, error: insertError } = await supabase
        .from('raffles')
        .insert({
          title,
          description,
          images: photos,
          category,
          prize_value: prizeNum,
          prize_currency: 'USD',
          proof_url: proofUrl,
          total_tickets: ticketsNum,
          ticket_price: 1.00,
          max_per_user: maxPerUserNum,
          start_date: startDate || new Date().toISOString(),
          end_date: endDate,
          status: 'active',
          creator_id: user.id,
          referral_enabled: referralEnabled,
          referral_rate: referralEnabled ? refRate : 0,
        })
        .select()
        .single()

      if (insertError) throw insertError

      router.push(`/raffles/${data.id}`)
    } catch (err: any) {
      setError(err.message || 'Failed to create raffle')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>Create Raffle</h1>
        <p style={styles.subtitle}>List a prize and let users buy tickets for a chance to win</p>

        {/* ── Progress Steps ── */}
        <div style={styles.stepRow}>
          {STEPS.map((_, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700,
                background: i + 1 < step ? '#067a0d' : i + 1 === step ? '#067a0d' : '#1e293b',
                color: i + 1 <= step ? '#fff' : '#64748b',
                border: i + 1 > step ? '1px solid rgba(255,255,255,0.08)' : 'none',
              }}>
                {i + 1 < step ? <CheckIcon /> : i + 1}
              </div>
              {i < STEPS.length - 1 && <div style={{ flex: 1, height: 2, marginLeft: 3, background: i + 1 < step ? '#067a0d' : '#1e293b', borderRadius: 1 }} />}
            </div>
          ))}
        </div>
        <div style={styles.stepLabels}>
          {STEPS.map((s, i) => (
            <span key={s} style={{ fontSize: 9, fontWeight: i + 1 === step ? 600 : 400, color: i + 1 === step ? '#067a0d' : '#64748b', width: '20%', textAlign: 'center' }}>{s}</span>
          ))}
        </div>

        {/* ── Error ── */}
        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: 12, marginBottom: 16, fontSize: 12, color: '#ef4444' }}>
            {error}
          </div>
        )}

        {/* ══════════ STEP 1: Details ══════════ */}
        {step === 1 && (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Raffle Details</h2>
            <p style={styles.cardSub}>Upload photos and describe your raffle prize</p>

            <label style={styles.label}>Prize Photos (up to 10)</label>
            <div style={styles.photoGrid}>
              {photos.map((url, i) => (
                <div key={i} style={styles.photoThumb}>
                  <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 10 }} />
                  <div style={styles.photoRemove} onClick={() => removePhoto(i)}><XIcon /></div>
                  {i === 0 && <div style={styles.photoCover}>COVER</div>}
                </div>
              ))}
              {photos.length < 10 && (
                <div style={styles.photoAdd} onClick={handleAddPhoto}>
                  <PlusIcon />
                  <span style={{ fontSize: 8, color: '#64748b' }}>Add</span>
                </div>
              )}
            </div>

            <label style={styles.label}>Raffle Title</label>
            <input
              style={styles.input}
              placeholder="e.g. Win a Brand New Tesla Model 3"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />

            <label style={styles.label}>Description</label>
            <textarea
              style={styles.textarea}
              placeholder="Describe the prize, rules, and what makes this raffle special..."
              value={description}
              onChange={e => setDescription(e.target.value)}
            />

            <label style={styles.label}>Prize Category</label>
            <select style={styles.select} value={category} onChange={e => setCategory(e.target.value)}>
              {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
            </select>
          </div>
        )}

        {/* ══════════ STEP 2: Prize Info ══════════ */}
        {step === 2 && (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Prize Information</h2>
            <p style={styles.cardSub}>Provide the prize value with proof</p>

            <label style={styles.label}>Prize Retail Value (USD)</label>
            <div style={{ position: 'relative', marginBottom: 14 }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16, fontWeight: 700, color: '#067a0d' }}>$</span>
              <input
                style={{ ...styles.input, paddingLeft: 30, fontSize: 16, fontWeight: 700, marginBottom: 0 }}
                placeholder="100,000"
                value={prizeValue}
                onChange={e => setPrizeValue(e.target.value)}
              />
            </div>

            <label style={styles.label}>Proof Link (official retailer URL)</label>
            <div style={{ position: 'relative', marginBottom: 14 }}>
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}><LinkIcon /></span>
              <input
                style={{ ...styles.input, paddingLeft: 34, marginBottom: 0 }}
                placeholder="https://tesla.com/model-3"
                value={proofUrl}
                onChange={e => setProofUrl(e.target.value)}
              />
            </div>

            {prizeNum > 0 && (
              <div style={styles.infoBox}>
                <div style={styles.infoLabel}>Auto-Calculated</div>
                <div style={styles.infoRow}>
                  <span style={styles.infoKey}>Minimum tickets (110% rule)</span>
                  <span style={styles.infoVal}>{minTickets.toLocaleString()}</span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.infoKey}>Ticket price</span>
                  <span style={styles.infoValGreen}>1 USDC</span>
                </div>
                <div style={{ ...styles.infoRow, marginBottom: 0 }}>
                  <span style={styles.infoKey}>Max revenue if sold out</span>
                  <span style={styles.infoValGreen}>${minTickets.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════ STEP 3: Tickets ══════════ */}
        {step === 3 && (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Ticket Settings</h2>
            <p style={styles.cardSub}>All tickets cost 1 USDC. Set the supply.</p>

            <label style={styles.label}>Total Tickets Available</label>
            <input
              style={styles.input}
              value={totalTickets || minTickets.toLocaleString()}
              onChange={e => setTotalTickets(e.target.value)}
            />
            <p style={{ fontSize: 9, color: '#067a0d', margin: '-8px 0 14px' }}>
              Minimum: {minTickets.toLocaleString()} (110% of ${prizeNum.toLocaleString()} prize)
            </p>

            <label style={styles.label}>Max Tickets Per User</label>
            <input
              style={styles.input}
              value={maxPerUser || maxPerUserNum.toLocaleString()}
              onChange={e => setMaxPerUser(e.target.value)}
            />
            <p style={{ fontSize: 9, color: '#64748b', margin: '-8px 0 14px' }}>
              Default: 1% of total supply
            </p>

            {/* Referral toggle */}
            <div style={styles.toggleRow}>
              <div style={styles.toggleHeader}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#f8fafc' }}>Enable Referral Program</div>
                  <div style={{ fontSize: 9, color: '#64748b' }}>Rewards come from YOUR creator share</div>
                </div>
                <div
                  style={referralEnabled ? styles.toggleOn : styles.toggleOff}
                  onClick={() => setReferralEnabled(!referralEnabled)}
                >
                  <div style={{ ...styles.toggleDot, marginLeft: referralEnabled ? 16 : 0 }} />
                </div>
              </div>
              {referralEnabled && (
                <div>
                  <label style={{ fontSize: 10, fontWeight: 500, color: '#94a3b8', marginBottom: 4, display: 'block' }}>
                    Referral commission (% of ticket price)
                  </label>
                  <input
                    style={{ ...styles.input, marginBottom: 4 }}
                    value={referralRate}
                    onChange={e => setReferralRate(e.target.value)}
                    placeholder="2"
                  />
                  <p style={{ fontSize: 8, color: '#fd8312', margin: 0 }}>
                    {refRate}% = ${(refRate / 100).toFixed(2)} per ticket sold via referral, paid from your 10% creator share
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════ STEP 4: Duration ══════════ */}
        {step === 4 && (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Raffle Duration</h2>
            <p style={styles.cardSub}>Set when the raffle ends (7 to 90 days)</p>

            <label style={styles.label}>Start Date</label>
            <input
              type="date"
              style={styles.input}
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
            />

            <label style={styles.label}>End Date</label>
            <input
              type="date"
              style={styles.input}
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
            />

            {durationDays > 0 && (
              <div style={styles.infoBox}>
                <div style={styles.infoRow}>
                  <span style={styles.infoKey}>Duration</span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: '#067a0d' }}>{durationDays} days</span>
                </div>
                <p style={{ fontSize: 9, color: '#64748b', margin: '4px 0 0' }}>
                  Or until all tickets are sold, whichever comes first
                </p>
                {(durationDays < 7 || durationDays > 90) && (
                  <p style={{ fontSize: 9, color: '#ef4444', margin: '4px 0 0', fontWeight: 600 }}>
                    Duration must be between 7 and 90 days
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* ══════════ STEP 5: Review ══════════ */}
        {step === 5 && (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Review & Publish</h2>
            <p style={styles.cardSub}>Confirm everything looks correct</p>

            {[
              ['Prize', title || '—'],
              ['Value', prizeNum > 0 ? `$${prizeNum.toLocaleString()}` : '—'],
              ['Category', CATEGORY_LABELS[category] || category],
              ['Photos', `${photos.length} uploaded`],
              ['Total Tickets', ticketsNum.toLocaleString()],
              ['Price per Ticket', '1 USDC'],
              ['Duration', durationDays > 0 ? `${durationDays} days` : '—'],
              ['Max per User', maxPerUserNum.toLocaleString()],
              ['Referral', referralEnabled ? `${refRate}% (from creator share)` : 'Disabled'],
            ].map(([k, v], i) => (
              <div key={i} style={{ ...styles.reviewRow, borderBottom: i < 8 ? '1px solid rgba(255,255,255,0.08)' : 'none' }}>
                <span style={styles.reviewKey}>{k}</span>
                <span style={styles.reviewVal}>{v}</span>
              </div>
            ))}

            <div style={styles.termsBox}>
              <ShieldIcon />
              <span>By publishing, you agree to Onagui Raffle Creator Terms. You do not need to deposit any funds. Onagui handles all prize fulfillment.</span>
            </div>
          </div>
        )}

        {/* ── Navigation Buttons ── */}
        <div style={styles.btnRow}>
          {step > 1 && (
            <button style={styles.btnBack} onClick={() => setStep(step - 1)}>
              Back
            </button>
          )}
          {step < 5 ? (
            <button style={styles.btnNext} onClick={() => setStep(step + 1)}>
              Continue
            </button>
          ) : (
            <button
              style={{ ...styles.btnNext, opacity: loading ? 0.6 : 1 }}
              onClick={handlePublish}
              disabled={loading}
            >
              {loading ? 'Publishing...' : 'Publish Raffle'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
