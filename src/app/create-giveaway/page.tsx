"use client"

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

const EMOJIS = ['🎁', '🎮', '💎', '🏆', '🎯', '⚡', '🔥', '⭐', '💰', '🎪', '🎨', '🚀', '🎭', '🎸', '🎬', '📱', '💻', '🎧', '👑', '🌟']

const BLOCKCHAINS = [
  { id: 'ethereum', name: 'Ethereum', icon: '⟠' },
  { id: 'polygon', name: 'Polygon', icon: '🔷' },
  { id: 'solana', name: 'Solana', icon: '◎' },
  { id: 'base', name: 'Base', icon: '🔵' },
]

const CURRENCIES = [
  { id: 'USDC', name: 'USDC', symbol: '$' },
  { id: 'ETH', name: 'ETH', symbol: 'Ξ' },
  { id: 'MATIC', name: 'MATIC', symbol: '◇' },
]

export default function CreateGiveawayPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [error, setError] = useState('')

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
    totalTickets: '',
    ticketPrice: '',
    ticketCurrency: 'USDC',
    isFree: true,
    blockchain: 'ethereum',
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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB')
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setFormData(prev => ({
        ...prev,
        imageFile: file,
        imagePreview: reader.result as string,
      }))
    }
    reader.readAsDataURL(file)
    setError('')
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

  const uploadImage = async () => {
    if (!formData.imageFile || !user) return null

    setUploadingImage(true)
    try {
      const fileExt = formData.imageFile.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `giveaways/${fileName}`

      const { error: uploadError, data } = await supabase.storage
        .from('giveaway-images')
        .upload(filePath, formData.imageFile, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('giveaway-images')
        .getPublicUrl(filePath)

      return publicUrl
    } catch (err: any) {
      console.error('Image upload error:', err)
      setError('Failed to upload image: ' + err.message)
      return null
    } finally {
      setUploadingImage(false)
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
      if (!formData.totalTickets || parseInt(formData.totalTickets) <= 0) {
        setError('Please enter valid number of tickets')
        return false
      }
    }
    if (step === 3) {
      if (!formData.isFree) {
        if (!formData.ticketPrice || parseFloat(formData.ticketPrice) <= 0) {
          setError('Please enter a valid ticket price')
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

  const handleSubmit = async (status: 'draft' | 'active') => {
    if (!validateStep()) return

    setLoading(true)
    setError('')

    try {
      // Upload image if provided
      let imageUrl = formData.imageUrl
      if (formData.imageFile) {
        const uploadedUrl = await uploadImage()
        if (!uploadedUrl) {
          throw new Error('Failed to upload image')
        }
        imageUrl = uploadedUrl
      }

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
            total_tickets: parseInt(formData.totalTickets),
            ticket_price: formData.isFree ? 0 : parseFloat(formData.ticketPrice),
            ticket_currency: formData.ticketCurrency,
            is_free: formData.isFree,
            blockchain: formData.blockchain,
            status: status,
            end_date: endDateTime.toISOString(),
          },
        ])
        .select()

      if (insertError) throw insertError

      // Create escrow account if paid giveaway
      if (!formData.isFree && data && data[0]) {
        await supabase.from('escrow_accounts').insert([
          {
            giveaway_id: data[0].id,
            currency: formData.ticketCurrency,
          },
        ])
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
                      <p className="text-slate-500 text-sm">PNG, JPG, GIF up to 5MB</p>
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
                  Total Number of Tickets
                </label>
                <input
                  type="number"
                  value={formData.totalTickets}
                  onChange={(e) => handleChange('totalTickets', e.target.value)}
                  placeholder="1000"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 focus:outline-none transition"
                />
                <p className="mt-2 text-sm text-slate-500">
                  Maximum number of participants that can enter
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Tickets */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Ticket Settings</h2>
                <p className="text-slate-400">How will people enter?</p>
              </div>

              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => handleChange('isFree', true)}
                  className={`w-full p-6 rounded-2xl border-2 transition-all text-left ${
                    formData.isFree
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-slate-700 bg-slate-800/30 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center text-2xl">
                      🎁
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-1">Free Entry</h3>
                      <p className="text-slate-400 text-sm">
                        Anyone can enter for free. Great for building community!
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleChange('isFree', false)}
                  className={`w-full p-6 rounded-2xl border-2 transition-all text-left ${
                    !formData.isFree
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-slate-700 bg-slate-800/30 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-yellow-600 rounded-xl flex items-center justify-center text-2xl">
                      💰
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-1">Paid Entry</h3>
                      <p className="text-slate-400 text-sm">
                        Charge for tickets with crypto. Perfect for fundraising!
                      </p>
                    </div>
                  </div>
                </button>
              </div>

              {!formData.isFree && (
                <div className="pt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Ticket Price
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="number"
                        step="0.01"
                        value={formData.ticketPrice}
                        onChange={(e) => handleChange('ticketPrice', e.target.value)}
                        placeholder="5.00"
                        className="flex-1 px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 focus:outline-none transition"
                      />
                      <select
                        value={formData.ticketCurrency}
                        onChange={(e) => handleChange('ticketCurrency', e.target.value)}
                        className="px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 focus:outline-none transition"
                      >
                        {CURRENCIES.map((currency) => (
                          <option key={currency.id} value={currency.id}>
                            {currency.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Blockchain
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {BLOCKCHAINS.map((blockchain) => (
                        <button
                          key={blockchain.id}
                          type="button"
                          onClick={() => handleChange('blockchain', blockchain.id)}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            formData.blockchain === blockchain.id
                              ? 'border-blue-500 bg-blue-500/10'
                              : 'border-slate-700 bg-slate-800/30 hover:border-slate-600'
                          }`}
                        >
                          <div className="text-3xl mb-2">{blockchain.icon}</div>
                          <div className="text-white font-semibold">{blockchain.name}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
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
                      {formData.isFree ? 'Free Entry' : `${formData.ticketPrice} ${formData.ticketCurrency}`}
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
                          {formData.totalTickets || '0'}
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
