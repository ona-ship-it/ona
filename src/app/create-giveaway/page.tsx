"use client"

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

const EMOJIS = ['🎁', '🎮', '💎', '🏆', '🎯', '⚡', '🔥', '⭐', '💰', '🎪', '🎨', '🚀', '🎭', '🎸', '🎬', '📱', '💻', '🎧', '👑', '🌟']

const GIVEAWAY_IMAGE_BUCKET = 'giveaway-images'
const DONATION_TICKET_PRICE_USDC = 1
const DONATION_TICKET_CURRENCY = 'USDC'
const UNLIMITED_TICKETS = 0
const MAX_IMAGE_SIZE_BYTES = 20 * 1024 * 1024
const MAX_IMAGE_SIZE_LABEL = '20MB'
const DONATION_SPLIT = {
  onagui: 50,
  giveawayValue: 40,
  creator: 10,
}

type CreatedGiveawaySummary = {
  id: string
  title: string
  shareCode: string
  shareUrl: string
  freeTicketLimit: number | null
}

export default function CreateGiveawayPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [error, setError] = useState('')
  const [createdGiveaway, setCreatedGiveaway] = useState<CreatedGiveawaySummary | null>(null)
  const [copiedShareLink, setCopiedShareLink] = useState(false)

  // Form data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    emoji: '🎁',
    imageFile: null as File | null,
    imagePreview: '',
    imageUrl: '',
    prizeValue: '',
    prizeCurrency: 'USD',
    freeTicketLimit: '',
    endDate: '',
    endTime: '',
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  const uploadImage = async (file: File) => {
    if (!user) return null

    setUploadingImage(true)
    try {
      const fileExt = file.name.split('.').pop() || 'jpg'
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `giveaways/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from(GIVEAWAY_IMAGE_BUCKET)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from(GIVEAWAY_IMAGE_BUCKET)
        .getPublicUrl(filePath)

      return publicUrl
    } catch (err: any) {
      const rawMessage = err?.message || 'Unknown upload error'
      const normalizedMessage = rawMessage.toLowerCase()

      if (normalizedMessage.includes('bucket') && normalizedMessage.includes('not found')) {
        setError(`Image upload is not configured: storage bucket "${GIVEAWAY_IMAGE_BUCKET}" was not found.`)
      } else if (normalizedMessage.includes('row-level security') || normalizedMessage.includes('permission') || normalizedMessage.includes('unauthorized')) {
        setError('Image upload permission denied. Please check storage policies for authenticated uploads.')
      } else {
        setError(`Failed to upload image: ${rawMessage}`)
      }

      return null
    } finally {
      setUploadingImage(false)
    }
  }

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    // Validate file size
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setError(`Image must be less than ${MAX_IMAGE_SIZE_LABEL}`)
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setFormData(prev => ({
        ...prev,
        imageFile: file,
        imagePreview: reader.result as string,
        imageUrl: '',
      }))
    }
    reader.readAsDataURL(file)
    setError('')

    const uploadedUrl = await uploadImage(file)
    if (!uploadedUrl) {
      setFormData(prev => ({
        ...prev,
        imageFile: null,
        imagePreview: '',
        imageUrl: '',
      }))
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    setFormData(prev => ({
      ...prev,
      imageUrl: uploadedUrl,
    }))
  }

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      imageFile: null,
      imagePreview: '',
      imageUrl: '',
    }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const validateStep = () => {
    if (step === 1) {
      if (!formData.title.trim()) {
        setError('Please enter a title')
        return false
      }
      if (!formData.description.trim()) {
        setError('Please enter a description')
        return false
      }
    }
    if (step === 2) {
      if (!formData.prizeValue || parseFloat(formData.prizeValue) <= 0) {
        setError('Please enter a valid prize value')
        return false
      }
    }
    if (step === 3) {
      if (formData.freeTicketLimit.trim() !== '') {
        const parsedLimit = parseInt(formData.freeTicketLimit, 10)
        if (!Number.isInteger(parsedLimit) || parsedLimit <= 0) {
          setError('Free ticket limit must be a whole number greater than 0')
          return false
        }
      }
    }
    if (step === 4) {
      if (!formData.endDate) {
        setError('Please select an end date')
        return false
      }
      if (!formData.endTime) {
        setError('Please select an end time')
        return false
      }
    }
    return true
  }

  const nextStep = () => {
    if (validateStep()) {
      setStep(step + 1)
    }
  }

  const prevStep = () => {
    setStep(step - 1)
    setError('')
  }

  const getShareUrlForCode = (shareCode: string) => {
    if (typeof window === 'undefined') return `https://onagui.com/share/${shareCode}`
    return `${window.location.origin}/share/${shareCode}`
  }

  const copyShareLink = async () => {
    if (!createdGiveaway) return
    await navigator.clipboard.writeText(createdGiveaway.shareUrl)
    setCopiedShareLink(true)
    setTimeout(() => setCopiedShareLink(false), 2000)
  }

  const handleSubmit = async (status: 'draft' | 'active') => {
    if (!validateStep()) return

    setLoading(true)
    setError('')

    try {
      let imageUrl = formData.imageUrl
      if (formData.imageFile && !imageUrl) {
        throw new Error('Image upload failed. Please re-select your image and try again.')
      }

      const parsedFreeTicketLimit = formData.freeTicketLimit.trim() === ''
        ? null
        : parseInt(formData.freeTicketLimit, 10)

      const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`)

      const { data, error: insertError } = await supabase
        .from('giveaways')
        .insert([
          {
            creator_id: user?.id,
            title: formData.title,
            description: formData.description,
            emoji: formData.emoji,
            image_url: imageUrl,
            prize_value: parseFloat(formData.prizeValue),
            prize_currency: formData.prizeCurrency,
            total_tickets: UNLIMITED_TICKETS,
            ticket_price: DONATION_TICKET_PRICE_USDC,
            ticket_currency: DONATION_TICKET_CURRENCY,
            is_free: false,
            free_ticket_limit: parsedFreeTicketLimit,
            status: status,
            end_date: endDateTime.toISOString(),
          },
        ])
        .select()

      if (insertError) throw insertError
      if (!data || !data[0]) throw new Error('Giveaway created but data could not be loaded')

      const created = data[0] as any
      const generatedShareCode = created.share_code || ''
      const canonicalShareUrl = generatedShareCode ? getShareUrlForCode(generatedShareCode) : ''

      if (generatedShareCode && created.share_url !== canonicalShareUrl) {
        await supabase
          .from('giveaways')
          .update({ share_url: canonicalShareUrl })
          .eq('id', created.id)
      }

      // Create escrow account for automatic paid donation tickets
      if (created) {
        await supabase.from('escrow_accounts').insert([
          {
            giveaway_id: created.id,
            currency: DONATION_TICKET_CURRENCY,
          },
        ])
      }

      if (status === 'active' && generatedShareCode) {
        setCreatedGiveaway({
          id: created.id,
          title: created.title || formData.title,
          shareCode: generatedShareCode,
          shareUrl: canonicalShareUrl,
          freeTicketLimit: parsedFreeTicketLimit,
        })
        return
      }

      router.push('/profile')
    } catch (err: any) {
      setError(err.message || 'Failed to create giveaway')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  if (createdGiveaway) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
        <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl relative z-10">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <h1 className="text-2xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                ONAGUI
              </h1>
            </Link>
          </div>
        </header>

        <div className="relative z-10 max-w-4xl mx-auto px-4 py-12">
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl p-8 space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Giveaway Published ✅</h2>
              <p className="text-slate-300">
                Your share link is generated automatically. Any user with this link can claim one free ticket for this giveaway.
              </p>
            </div>

            <div className="p-4 bg-slate-800/40 border border-slate-700 rounded-xl space-y-2 text-sm">
              <p className="text-slate-200">• Share link is unique to this giveaway: <span className="font-mono">{createdGiveaway.shareCode}</span></p>
              <p className="text-slate-200">• One free ticket per user from this link</p>
              <p className="text-slate-200">
                • {createdGiveaway.freeTicketLimit ? `Free-ticket cap active: ${createdGiveaway.freeTicketLimit} total free tickets` : 'No free-ticket cap set (unlimited free tickets)'}
              </p>
            </div>

            <div className="flex gap-3">
              <input
                type="text"
                readOnly
                value={createdGiveaway.shareUrl}
                className="flex-1 px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white"
              />
              <button
                onClick={copyShareLink}
                className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all"
              >
                {copiedShareLink ? 'Copied!' : 'Copy Link'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Link
                href={`/giveaways/${createdGiveaway.id}`}
                className="text-center py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-all"
              >
                Open Giveaway
              </Link>
              <Link
                href="/profile"
                className="text-center py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition-all border border-slate-700"
              >
                Go to Profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl relative z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <h1 className="text-2xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              ONAGUI
            </h1>
          </Link>
          <Link
            href="/profile"
            className="text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-12">
        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg transition-all ${
                    s === step
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/50 scale-110'
                      : s < step
                      ? 'bg-green-600 text-white'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {s < step ? '✓' : s}
                </div>
                {s < 4 && (
                  <div
                    className={`flex-1 h-1 mx-2 rounded-full transition-all ${
                      s < step ? 'bg-green-600' : 'bg-slate-800'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm text-slate-400">
            <span className={step === 1 ? 'text-blue-400 font-semibold' : ''}>Details</span>
            <span className={step === 2 ? 'text-blue-400 font-semibold' : ''}>Prize</span>
            <span className={step === 3 ? 'text-blue-400 font-semibold' : ''}>Tickets</span>
            <span className={step === 4 ? 'text-blue-400 font-semibold' : ''}>Schedule</span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Form Card */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl p-8 mb-6">
          {/* Step 1: Details */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Create Your Giveaway</h2>
                <p className="text-slate-400">Let's start with the basics</p>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Giveaway Image
                </label>
                
                {formData.imagePreview ? (
                  <div className="relative">
                    <div className="relative w-full h-64 bg-slate-800 rounded-2xl overflow-hidden">
                      <Image
                        src={formData.imagePreview}
                        alt="Giveaway preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-3 right-3 w-10 h-10 bg-red-600 hover:bg-red-700 text-white rounded-xl flex items-center justify-center transition-all shadow-lg"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-64 border-2 border-dashed border-slate-700 rounded-2xl bg-slate-800/30 hover:border-blue-500 hover:bg-slate-800/50 transition-all cursor-pointer flex flex-col items-center justify-center gap-4"
                  >
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-3xl">
                      📸
                    </div>
                    <div className="text-center">
                      <p className="text-white font-semibold mb-1">Click to upload image</p>
                      <p className="text-slate-500 text-sm">Any image format up to {MAX_IMAGE_SIZE_LABEL}</p>
                    </div>
                  </div>
                )}
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                
                <p className="mt-2 text-sm text-slate-500">
                  Optional: Add an image to make your giveaway stand out
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Or Choose an Emoji Icon
                </label>
                <div className="grid grid-cols-10 gap-2">
                  {EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => handleChange('emoji', emoji)}
                      className={`w-12 h-12 rounded-xl text-2xl transition-all ${
                        formData.emoji === emoji
                          ? 'bg-blue-600 shadow-lg shadow-blue-500/50 scale-110'
                          : 'bg-slate-800 hover:bg-slate-700'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Giveaway Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="Amazing Prize Giveaway"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Describe your giveaway and what participants can win..."
                  rows={5}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 focus:outline-none transition resize-none"
                />
              </div>
            </div>
          )}

          {/* Step 2: Prize */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Prize Details</h2>
                <p className="text-slate-400">What are you giving away?</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Prize Value
                </label>
                <div className="flex gap-3">
                  <input
                    type="number"
                    step="0.01"
                    value={formData.prizeValue}
                    onChange={(e) => handleChange('prizeValue', e.target.value)}
                    placeholder="1000"
                    className="flex-1 px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 focus:outline-none transition"
                  />
                  <select
                    value={formData.prizeCurrency}
                    onChange={(e) => handleChange('prizeCurrency', e.target.value)}
                    className="px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 focus:outline-none transition"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Ticket Rules
                </label>
                <div className="p-4 bg-slate-800/40 border border-slate-700 rounded-xl text-sm space-y-2">
                  <p className="text-slate-200">• Unlimited entries overall</p>
                  <p className="text-slate-200">• One free ticket per user (automatic)</p>
                  <p className="text-slate-200">• Optional creator-set cap for total free tickets</p>
                  <p className="text-slate-200">• Paid donation tickets enabled automatically at 1 USDC</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Tickets */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Ticket Settings</h2>
                <p className="text-slate-400">ONAGUI uses automatic ticket rules for giveaways</p>
              </div>

              <div className="space-y-4">
                <div className="w-full p-6 rounded-2xl border-2 border-green-500/40 bg-green-500/10 text-left">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center text-2xl">
                      🎁
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-1">Free Entry (Automatic)</h3>
                      <p className="text-slate-300 text-sm">
                        Every giveaway includes one free ticket per user automatically.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="w-full p-6 rounded-2xl border-2 border-blue-500/40 bg-blue-500/10 text-left">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-2xl">
                      💰
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-1">Donation Tickets (Automatic)</h3>
                      <p className="text-slate-300 text-sm">
                        Paid donation tickets are automatically enabled at 1 USDC.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="w-full p-6 rounded-2xl border-2 border-cyan-500/40 bg-cyan-500/10 text-left">
                  <h3 className="text-xl font-bold text-white mb-2">Share Link (Automatic)</h3>
                  <p className="text-slate-200 text-sm mb-2">
                    A unique share link is generated when you publish. Anyone with that link can claim one free ticket for this giveaway.
                  </p>
                  <p className="text-slate-300 text-sm">
                    If you set a free-ticket limit, the link still works but free claims stop once that limit is reached.
                  </p>
                </div>

                <div className="w-full p-6 rounded-2xl border-2 border-yellow-500/40 bg-yellow-500/10 text-left">
                  <h3 className="text-xl font-bold text-white mb-2">Donation Split (Internal Rules)</h3>
                  <p className="text-slate-200 text-sm mb-2">
                    Paid donation tickets are split automatically according to ONAGUI internal rules:
                  </p>
                  <ul className="text-slate-200 text-sm space-y-1">
                    <li>• {DONATION_SPLIT.onagui}% to ONAGUI platform</li>
                    <li>• {DONATION_SPLIT.giveawayValue}% added to giveaway value / winners pool</li>
                    <li>• {DONATION_SPLIT.creator}% to creator commission</li>
                  </ul>
                </div>

                <div className="pt-2">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Free Ticket Limit (Optional)
                  </label>
                  <input
                    type="number"
                    min={1}
                    step={1}
                    value={formData.freeTicketLimit}
                    onChange={(e) => handleChange('freeTicketLimit', e.target.value)}
                    placeholder="Leave empty for unlimited free tickets"
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 focus:outline-none transition"
                  />
                  <p className="mt-2 text-sm text-slate-500">
                    Optional: after this many free tickets are claimed, only paid donation tickets remain.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Schedule */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Schedule</h2>
                <p className="text-slate-400">When will the giveaway end?</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleChange('endDate', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 focus:outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => handleChange('endTime', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 focus:outline-none transition"
                  />
                </div>
              </div>

              {/* Preview */}
              <div className="p-6 bg-gradient-to-r from-blue-900/30 to-cyan-900/30 border border-blue-800/50 rounded-2xl">
                <h3 className="text-lg font-bold text-white mb-4">Preview</h3>
                <div className="bg-slate-900/50 rounded-2xl overflow-hidden">
                  {/* Image or Emoji */}
                  <div className="relative h-40 bg-gradient-to-br from-blue-900/30 to-cyan-900/30 flex items-center justify-center">
                    {formData.imagePreview ? (
                      <Image
                        src={formData.imagePreview}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="text-5xl">{formData.emoji}</div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <h4 className="text-xl font-bold text-white mb-1">{formData.title || 'Your Giveaway'}</h4>
                    <p className="text-slate-400 text-sm mb-3">
                      {formData.freeTicketLimit.trim() !== ''
                        ? `1 free ticket per user (max ${formData.freeTicketLimit} free tickets) + paid donation tickets (1 USDC)`
                        : '1 free ticket per user + paid donation tickets (1 USDC)'}
                    </p>
                    <p className="text-slate-300 text-sm mb-3">
                      {formData.description || 'Your description will appear here'}
                    </p>
                    <div className="flex gap-4 text-sm">
                      <div>
                        <span className="text-slate-500">Prize:</span>
                        <span className="text-white ml-2 font-semibold">
                          ${formData.prizeValue || '0'} {formData.prizeCurrency}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500">Tickets:</span>
                        <span className="text-white ml-2 font-semibold">
                          Unlimited
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-4">
          {step > 1 && (
            <button
              onClick={prevStep}
              disabled={loading || uploadingImage}
              className="flex-1 py-4 px-6 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition-all border border-slate-700 disabled:opacity-50"
            >
              Back
            </button>
          )}
          {step < 4 ? (
            <button
              onClick={nextStep}
              disabled={loading || uploadingImage}
              className="flex-1 py-4 px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/50 disabled:opacity-50"
            >
              Continue
            </button>
          ) : (
            <div className="flex-1 flex gap-4">
              <button
                onClick={() => handleSubmit('draft')}
                disabled={loading || uploadingImage}
                className="flex-1 py-4 px-6 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition-all border border-slate-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save as Draft'}
              </button>
              <button
                onClick={() => handleSubmit('active')}
                disabled={loading || uploadingImage}
                className="flex-1 py-4 px-6 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-xl transition-all shadow-lg shadow-green-500/50 disabled:opacity-50"
              >
                {loading ? (uploadingImage ? 'Uploading image...' : 'Publishing...') : 'Publish Now'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
