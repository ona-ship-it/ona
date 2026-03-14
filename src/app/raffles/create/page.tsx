'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

/* ── Icons ── */
const CheckIcon = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
const XIcon = () => <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
const PlusIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
const LinkIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
const ShieldIcon = () => <svg width="14" height="14" viewBox="0 0 24 24"><path fill="#067a0d" d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm-2 16l-4-4 1.41-1.41L10 15.17l6.59-6.59L18 10l-8 8z"/></svg>
const MapPinIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
const GlobeIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>

/* ── Styles ── */
const s = {
  page: { background: '#0a1929', minHeight: '100vh', fontFamily: "'Inter', system-ui, sans-serif" } as React.CSSProperties,
  inner: { padding: '24px 16px' } as React.CSSProperties,
  container: { maxWidth: 600, margin: '0 auto' } as React.CSSProperties,
  title: { fontSize: 24, fontWeight: 800, color: '#f8fafc', marginBottom: 4, fontFamily: "'Rajdhani', sans-serif" } as React.CSSProperties,
  subtitle: { fontSize: 13, color: '#94a3b8', marginBottom: 24 } as React.CSSProperties,
  card: { background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 20, marginBottom: 16 } as React.CSSProperties,
  cardTitle: { fontSize: 18, fontWeight: 700, color: '#f8fafc', margin: '0 0 4px' } as React.CSSProperties,
  cardSub: { fontSize: 11, color: '#94a3b8', margin: '0 0 18px' } as React.CSSProperties,
  label: { fontSize: 11, fontWeight: 500, color: '#94a3b8', marginBottom: 6, display: 'block' } as React.CSSProperties,
  input: { width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)', background: '#0f1419', color: '#f8fafc', fontSize: 13, outline: 'none', boxSizing: 'border-box' as const, marginBottom: 14 } as React.CSSProperties,
  inputError: { borderColor: 'rgba(239,68,68,0.5)' } as React.CSSProperties,
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
  btnNext: { flex: 1, padding: 12, border: 'none', borderRadius: 10, background: 'linear-gradient(135deg,#2be937,#067a0d)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' } as React.CSSProperties,
  stepRow: { display: 'flex', alignItems: 'center', gap: 3, marginBottom: 8 } as React.CSSProperties,
  stepLabels: { display: 'flex', justifyContent: 'space-between', marginBottom: 24 } as React.CSSProperties,
  photoGrid: { display: 'flex', gap: 8, flexWrap: 'wrap' as const, marginBottom: 18 } as React.CSSProperties,
  photoThumb: { width: 68, height: 68, borderRadius: 10, background: '#0f1419', border: '1px solid rgba(255,255,255,0.08)', position: 'relative' as const, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' as const } as React.CSSProperties,
  photoRemove: { position: 'absolute' as const, top: -5, right: -5, width: 18, height: 18, borderRadius: '50%', background: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '2px solid #0a1929', zIndex: 1 } as React.CSSProperties,
  photoCover: { position: 'absolute' as const, bottom: 3, left: 0, right: 0, textAlign: 'center' as const, fontSize: 7, fontWeight: 700, color: '#067a0d' } as React.CSSProperties,
  photoAdd: { width: 68, height: 68, borderRadius: 10, border: '2px dashed rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', cursor: 'pointer', gap: 2 } as React.CSSProperties,
  toggleRow: { background: '#0f1419', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: 14, marginBottom: 14 } as React.CSSProperties,
  toggleHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 } as React.CSSProperties,
  reviewRow: { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.08)' } as React.CSSProperties,
  reviewKey: { fontSize: 11, color: '#94a3b8' } as React.CSSProperties,
  reviewVal: { fontSize: 12, fontWeight: 600, color: '#f8fafc' } as React.CSSProperties,
  termsBox: { background: 'rgba(6,122,13,0.08)', border: '1px solid rgba(6,122,13,0.2)', borderRadius: 10, padding: 12, marginTop: 16, fontSize: 10, color: '#94a3b8', display: 'flex', alignItems: 'flex-start', gap: 8 } as React.CSSProperties,
  fieldError: { fontSize: 10, color: '#ef4444', margin: '-10px 0 10px', display: 'block' } as React.CSSProperties,
}

const STEPS = ['Details', 'Prize Info', 'Tickets', 'Duration', 'Review']
const CATEGORIES = ['vehicle', 'electronics', 'cash', 'luxury', 'real_estate', 'other']
const CATEGORY_LABELS: Record<string, string> = {
  vehicle: 'Vehicle', electronics: 'Electronics', cash: 'Cash (USDC)',
  luxury: 'Luxury Goods', real_estate: 'Real Estate', other: 'Other',
}

const COUNTRIES = [
  '', 'US', 'GB', 'CA', 'AU', 'DE', 'FR', 'JP', 'KR', 'BR', 'MX', 'IN', 'AE', 'SA', 'MA',
  'NG', 'ZA', 'EG', 'KE', 'GH', 'PK', 'BD', 'PH', 'ID', 'TH', 'VN', 'MY', 'SG', 'NZ',
  'IT', 'ES', 'PT', 'NL', 'BE', 'SE', 'NO', 'DK', 'FI', 'CH', 'AT', 'PL', 'CZ', 'RO',
  'TR', 'RU', 'UA', 'AR', 'CL', 'CO', 'PE', 'VE',
]
const COUNTRY_LABELS: Record<string, string> = {
  '': 'Open to all countries',
  US: 'United States', GB: 'United Kingdom', CA: 'Canada', AU: 'Australia',
  DE: 'Germany', FR: 'France', JP: 'Japan', KR: 'South Korea', BR: 'Brazil',
  MX: 'Mexico', IN: 'India', AE: 'UAE', SA: 'Saudi Arabia', MA: 'Morocco',
  NG: 'Nigeria', ZA: 'South Africa', EG: 'Egypt', KE: 'Kenya', GH: 'Ghana',
  PK: 'Pakistan', BD: 'Bangladesh', PH: 'Philippines', ID: 'Indonesia',
  TH: 'Thailand', VN: 'Vietnam', MY: 'Malaysia', SG: 'Singapore', NZ: 'New Zealand',
  IT: 'Italy', ES: 'Spain', PT: 'Portugal', NL: 'Netherlands', BE: 'Belgium',
  SE: 'Sweden', NO: 'Norway', DK: 'Denmark', FI: 'Finland', CH: 'Switzerland',
  AT: 'Austria', PL: 'Poland', CZ: 'Czech Republic', RO: 'Romania',
  TR: 'Turkey', RU: 'Russia', UA: 'Ukraine', AR: 'Argentina', CL: 'Chile',
  CO: 'Colombia', PE: 'Peru', VE: 'Venezuela',
}

// Compress image client-side before upload (max 800px, ~200KB)
async function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new window.Image()
    const reader = new FileReader()
    reader.onload = (e) => {
      img.src = e.target?.result as string
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const MAX = 800
        let { width, height } = img
        if (width > MAX || height > MAX) {
          if (width > height) { height = Math.round((height * MAX) / width); width = MAX }
          else { width = Math.round((width * MAX) / height); height = MAX }
        }
        canvas.width = width
        canvas.height = height
        canvas.getContext('2d')!.drawImage(img, 0, 0, width, height)
        canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.82)
      }
    }
    reader.readAsDataURL(file)
  })
}

export default function CreateRafflePage() {
  const router = useRouter()
  const [authChecked, setAuthChecked] = useState(false)
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [stepErrors, setStepErrors] = useState<Record<string, string>>({})

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
  const [countryRestriction, setCountryRestriction] = useState('')
  const [locationName, setLocationName] = useState('')

  // Auth guard on mount
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.replace('/login')
      else setAuthChecked(true)
    })
  }, [])

  if (!authChecked) {
    return (
      <div style={{ background: '#0a1929', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 32, height: 32, border: '3px solid rgba(0,255,136,0.2)', borderTopColor: '#00ff88', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  const prizeNum = parseFloat(prizeValue.replace(/,/g, '')) || 0
  const minTickets = Math.ceil(prizeNum * 1.1)
  const ticketsNum = parseInt(totalTickets.replace(/,/g, '')) || minTickets
  const maxPerUserNum = parseInt(maxPerUser.replace(/,/g, '')) || Math.max(1, Math.floor(ticketsNum * 0.01))
  const refRate = parseFloat(referralRate) || 0
  const durationDays = startDate && endDate
    ? Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))
    : 0

  // Per-step validation
  function validateStep(s: number): Record<string, string> {
    const errs: Record<string, string> = {}
    if (s === 1) {
      if (!title.trim()) errs.title = 'Title is required'
      if (!description.trim()) errs.description = 'Description is required'
    }
    if (s === 2) {
      if (!prizeNum || prizeNum < 1) errs.prizeValue = 'Enter a valid prize value'
      if (!proofUrl.trim()) errs.proofUrl = 'Proof link is required'
    }
    if (s === 3) {
      if (ticketsNum < minTickets) errs.totalTickets = `Minimum ${minTickets.toLocaleString()} tickets required (110% rule)`
    }
    if (s === 4) {
      if (!endDate) errs.endDate = 'End date is required'
      if (durationDays < 7) errs.endDate = 'Duration must be at least 7 days'
      if (durationDays > 90) errs.endDate = 'Duration cannot exceed 90 days'
    }
    return errs
  }

  function handleNext() {
    const errs = validateStep(step)
    if (Object.keys(errs).length > 0) { setStepErrors(errs); return }
    setStepErrors({})
    setStep(step + 1)
  }

  // Photo upload with compression
  const handleAddPhoto = () => {
    if (photos.length >= 10) return
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0]
      if (!file) return
      try {
        setUploading(true)
        const compressed = await compressImage(file)
        const supabase = createClient()
        const ext = file.name.split('.').pop() || 'jpg'
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { error: uploadError } = await supabase.storage.from('raffle-images').upload(fileName, compressed, { contentType: 'image/jpeg' })
        if (uploadError) throw uploadError
        const { data: { publicUrl } } = supabase.storage.from('raffle-images').getPublicUrl(fileName)
        setPhotos(prev => [...prev, publicUrl])
      } catch (err) {
        console.error('Upload failed:', err)
        setError('Failed to upload image. Check that the raffle-images bucket exists in Supabase Storage.')
      } finally {
        setUploading(false)
      }
    }
    input.click()
  }

  const removePhoto = (idx: number) => setPhotos(prev => prev.filter((_, i) => i !== idx))

  const handlePublish = async () => {
    const errs = validateStep(5)
    if (Object.keys(errs).length > 0) { setStepErrors(errs); return }
    setLoading(true)
    setError('')
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/login'); return }

      const { data, error: insertError } = await supabase.from('raffles').insert({
        title,
        description,
        image_urls: photos,
        category,
        prize_value: prizeNum,
        prize_currency: 'USD',
        proof_url: proofUrl,
        total_tickets: ticketsNum,
        tickets_sold: 0,
        base_ticket_price: 1.00,
        ticket_price: 1.00,
        max_per_user: maxPerUserNum,
        start_date: startDate || new Date().toISOString(),
        end_date: endDate,
        status: 'active',
        creator_id: user.id,
        referral_enabled: referralEnabled,
        referral_rate: referralEnabled ? refRate : 0,
        country_restriction: countryRestriction || null,
        location_name: locationName || null,
      }).select().single()

      if (insertError) throw insertError
      router.push(`/raffles/${data.id}`)
    } catch (err: any) {
      setError(err.message || 'Failed to create raffle')
    } finally {
      setLoading(false)
    }
  }

  const E = stepErrors

  return (
    <div style={s.page}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={s.inner}>
        <div style={s.container}>
          <h1 style={s.title}>Create Raffle</h1>
          <p style={s.subtitle}>List a prize and let users buy tickets for a chance to win</p>

          {/* Progress */}
          <div style={s.stepRow}>
            {STEPS.map((_, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700,
                  background: i + 1 <= step ? '#067a0d' : '#1e293b',
                  color: i + 1 <= step ? '#fff' : '#64748b',
                  border: i + 1 > step ? '1px solid rgba(255,255,255,0.08)' : 'none',
                }}>
                  {i + 1 < step ? <CheckIcon /> : i + 1}
                </div>
                {i < STEPS.length - 1 && <div style={{ flex: 1, height: 2, marginLeft: 3, background: i + 1 < step ? '#067a0d' : '#1e293b', borderRadius: 1 }} />}
              </div>
            ))}
          </div>
          <div style={s.stepLabels}>
            {STEPS.map((st, i) => (
              <span key={st} style={{ fontSize: 9, fontWeight: i + 1 === step ? 600 : 400, color: i + 1 === step ? '#067a0d' : '#64748b', width: '20%', textAlign: 'center' }}>{st}</span>
            ))}
          </div>

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: 12, marginBottom: 16, fontSize: 12, color: '#ef4444' }}>
              {error}
            </div>
          )}

          {/* ── STEP 1 ── */}
          {step === 1 && (
            <div style={s.card}>
              <h2 style={s.cardTitle}>Raffle Details</h2>
              <p style={s.cardSub}>Upload photos and describe your raffle prize</p>

              <label style={s.label}>Prize Photos (up to 10)</label>
              <div style={s.photoGrid}>
                {photos.map((url, i) => (
                  <div key={i} style={s.photoThumb}>
                    <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={s.photoRemove} onClick={() => removePhoto(i)}><XIcon /></div>
                    {i === 0 && <div style={s.photoCover}>COVER</div>}
                  </div>
                ))}
                {photos.length < 10 && (
                  <div style={s.photoAdd} onClick={handleAddPhoto}>
                    {uploading
                      ? <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#067a0d', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                      : <><PlusIcon /><span style={{ fontSize: 8, color: '#64748b' }}>Add</span></>}
                  </div>
                )}
              </div>

              <label style={s.label}>Raffle Title *</label>
              <input style={{ ...s.input, ...(E.title ? s.inputError : {}) }} placeholder="e.g. Win a Brand New Tesla Model 3" value={title} onChange={e => setTitle(e.target.value)} />
              {E.title && <span style={s.fieldError}>{E.title}</span>}

              <label style={s.label}>Description *</label>
              <textarea style={{ ...s.textarea, ...(E.description ? { borderColor: 'rgba(239,68,68,0.5)' } : {}) }} placeholder="Describe the prize, rules, and what makes this raffle special..." value={description} onChange={e => setDescription(e.target.value)} />
              {E.description && <span style={s.fieldError}>{E.description}</span>}

              <label style={s.label}>Prize Category</label>
              <select style={s.select} value={category} onChange={e => setCategory(e.target.value)}>
                {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
              </select>

              <label style={{ ...s.label, display: 'flex', alignItems: 'center', gap: 6 }}><GlobeIcon /> Country Restriction (optional)</label>
              <select style={s.select} value={countryRestriction} onChange={e => setCountryRestriction(e.target.value)}>
                {COUNTRIES.map(c => <option key={c} value={c}>{COUNTRY_LABELS[c] || c}</option>)}
              </select>
              {countryRestriction && (
                <p style={{ fontSize: 9, color: '#fd8312', margin: '-8px 0 14px' }}>
                  Only users from {COUNTRY_LABELS[countryRestriction] || countryRestriction} can participate
                </p>
              )}

              <label style={{ ...s.label, display: 'flex', alignItems: 'center', gap: 6 }}><MapPinIcon /> Location (optional)</label>
              <input style={s.input} placeholder="e.g. Los Angeles, CA" value={locationName} onChange={e => setLocationName(e.target.value)} />
            </div>
          )}

          {/* ── STEP 2 ── */}
          {step === 2 && (
            <div style={s.card}>
              <h2 style={s.cardTitle}>Prize Information</h2>
              <p style={s.cardSub}>Provide the prize value with proof</p>

              <label style={s.label}>Prize Retail Value (USD) *</label>
              <div style={{ position: 'relative', marginBottom: 14 }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16, fontWeight: 700, color: '#067a0d' }}>$</span>
                <input style={{ ...s.input, paddingLeft: 30, fontSize: 16, fontWeight: 700, marginBottom: 0, ...(E.prizeValue ? s.inputError : {}) }} placeholder="100,000" value={prizeValue} onChange={e => setPrizeValue(e.target.value)} />
              </div>
              {E.prizeValue && <span style={s.fieldError}>{E.prizeValue}</span>}

              <label style={s.label}>Proof Link (official retailer URL) *</label>
              <div style={{ position: 'relative', marginBottom: 14 }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}><LinkIcon /></span>
                <input style={{ ...s.input, paddingLeft: 34, marginBottom: 0, ...(E.proofUrl ? s.inputError : {}) }} placeholder="https://tesla.com/model-3" value={proofUrl} onChange={e => setProofUrl(e.target.value)} />
              </div>
              {E.proofUrl && <span style={s.fieldError}>{E.proofUrl}</span>}

              {prizeNum > 0 && (
                <div style={s.infoBox}>
                  <div style={s.infoLabel}>Auto-Calculated</div>
                  <div style={s.infoRow}><span style={s.infoKey}>Minimum tickets (110% rule)</span><span style={s.infoVal}>{minTickets.toLocaleString()}</span></div>
                  <div style={s.infoRow}><span style={s.infoKey}>Ticket price</span><span style={s.infoValGreen}>1 USDC</span></div>
                  <div style={{ ...s.infoRow, marginBottom: 0 }}><span style={s.infoKey}>Max revenue if sold out</span><span style={s.infoValGreen}>${minTickets.toLocaleString()}</span></div>
                </div>
              )}
            </div>
          )}

          {/* ── STEP 3 ── */}
          {step === 3 && (
            <div style={s.card}>
              <h2 style={s.cardTitle}>Ticket Settings</h2>
              <p style={s.cardSub}>All tickets cost 1 USDC. Set the supply.</p>

              <label style={s.label}>Total Tickets Available *</label>
              <input style={{ ...s.input, ...(E.totalTickets ? s.inputError : {}) }} value={totalTickets || minTickets.toLocaleString()} onChange={e => setTotalTickets(e.target.value)} />
              {E.totalTickets
                ? <span style={s.fieldError}>{E.totalTickets}</span>
                : <p style={{ fontSize: 9, color: '#067a0d', margin: '-8px 0 14px' }}>Minimum: {minTickets.toLocaleString()} (110% of ${prizeNum.toLocaleString()} prize)</p>}

              <label style={s.label}>Max Tickets Per User</label>
              <input style={s.input} value={maxPerUser || maxPerUserNum.toLocaleString()} onChange={e => setMaxPerUser(e.target.value)} />
              <p style={{ fontSize: 9, color: '#64748b', margin: '-8px 0 14px' }}>Default: 1% of total supply</p>

              <div style={s.toggleRow}>
                <div style={s.toggleHeader}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#f8fafc' }}>Enable Referral Program</div>
                    <div style={{ fontSize: 9, color: '#64748b' }}>Rewards come from YOUR creator share</div>
                  </div>
                  <div style={{ width: 36, height: 20, borderRadius: 10, background: referralEnabled ? '#067a0d' : '#334155', padding: 2, cursor: 'pointer' }} onClick={() => setReferralEnabled(!referralEnabled)}>
                    <div style={{ width: 16, height: 16, borderRadius: 8, background: '#fff', transition: 'margin-left 0.2s', marginLeft: referralEnabled ? 16 : 0 }} />
                  </div>
                </div>
                {referralEnabled && (
                  <div>
                    <label style={{ fontSize: 10, fontWeight: 500, color: '#94a3b8', marginBottom: 4, display: 'block' }}>Referral commission (%)</label>
                    <input style={{ ...s.input, marginBottom: 4 }} value={referralRate} onChange={e => setReferralRate(e.target.value)} placeholder="2" />
                    <p style={{ fontSize: 8, color: '#fd8312', margin: 0 }}>
                      {refRate}% = ${(refRate / 100).toFixed(2)} per ticket sold via referral
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── STEP 4 ── */}
          {step === 4 && (
            <div style={s.card}>
              <h2 style={s.cardTitle}>Raffle Duration</h2>
              <p style={s.cardSub}>Set when the raffle ends (7 to 90 days)</p>

              <label style={s.label}>Start Date</label>
              <input type="date" style={s.input} value={startDate} onChange={e => setStartDate(e.target.value)} />

              <label style={s.label}>End Date *</label>
              <input type="date" style={{ ...s.input, ...(E.endDate ? s.inputError : {}) }} value={endDate} onChange={e => setEndDate(e.target.value)} />
              {E.endDate && <span style={s.fieldError}>{E.endDate}</span>}

              {durationDays > 0 && !E.endDate && (
                <div style={s.infoBox}>
                  <div style={s.infoRow}>
                    <span style={s.infoKey}>Duration</span>
                    <span style={{ fontSize: 16, fontWeight: 700, color: '#067a0d' }}>{durationDays} days</span>
                  </div>
                  <p style={{ fontSize: 9, color: '#64748b', margin: '4px 0 0' }}>Or until all tickets are sold, whichever comes first</p>
                </div>
              )}
            </div>
          )}

          {/* ── STEP 5 ── */}
          {step === 5 && (
            <div style={s.card}>
              <h2 style={s.cardTitle}>Review & Publish</h2>
              <p style={s.cardSub}>Confirm everything looks correct</p>

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
                ['Country', countryRestriction ? COUNTRY_LABELS[countryRestriction] || countryRestriction : 'Open to all'],
                ['Location', locationName || 'Not specified'],
              ].map(([k, v], i, arr) => (
                <div key={i} style={{ ...s.reviewRow, borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none' }}>
                  <span style={s.reviewKey}>{k}</span>
                  <span style={s.reviewVal}>{v}</span>
                </div>
              ))}

              <div style={s.termsBox}>
                <ShieldIcon />
                <span>By publishing, you agree to Onagui Raffle Creator Terms. You do not need to deposit any funds. Onagui handles all prize fulfillment.</span>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div style={s.btnRow}>
            {step > 1 && <button style={s.btnBack} onClick={() => { setStepErrors({}); setStep(step - 1) }}>Back</button>}
            {step < 5
              ? <button style={s.btnNext} onClick={handleNext}>Continue</button>
              : <button style={{ ...s.btnNext, opacity: loading ? 0.6 : 1 }} onClick={handlePublish} disabled={loading}>
                  {loading ? 'Publishing...' : 'Publish Raffle'}
                </button>}
          </div>
        </div>
      </div>
    </div>
  )
}
