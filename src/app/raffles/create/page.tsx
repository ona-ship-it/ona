'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { isAdmin } from '@/lib/admin'

type Step = 1 | 2 | 3 | 4

export default function CreateRafflePage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [user, setUser] = useState<any>(null)
  const [userIsAdmin, setUserIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState<Step>(1)

  // Step 1: Basic Info
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [emoji, setEmoji] = useState('🎟️')
  const [country, setCountry] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')

  // Step 2: Prize Details
  const [prizeDescription, setPrizeDescription] = useState('')
  const [prizeValue, setPrizeValue] = useState('')
  const [prizeCurrency, setPrizeCurrency] = useState('USDC')

  // Step 3: Ticket Configuration
  const [totalTickets, setTotalTickets] = useState('')
  const [ticketPrice, setTicketPrice] = useState('')
  const [hasDeadline, setHasDeadline] = useState(false)
  const [deadline, setDeadline] = useState('')

  // Step 4: Optional Features
  const [secondaryPrizes, setSecondaryPrizes] = useState<Array<{place: number, prize: string, value: number}>>([])
  const [escrowType, setEscrowType] = useState<'full' | 'partial'>('full')

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user) {
      router.push('/login')
      return
    }

    setUser(session.user)
    setUserIsAdmin(isAdmin(session.user.email))
    
    // Check if user has creator profile, create if not
    const { data: profile } = await supabase
      .from('creator_profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .single()

    if (!profile) {
      await supabase.from('creator_profiles').insert({
        user_id: session.user.id,
        display_name: session.user.email?.split('@')[0] || 'Creator',
      })
    }

    setLoading(false)
  }

  function addTag() {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim().toLowerCase()])
      setTagInput('')
    }
  }

  function removeTag(tag: string) {
    setTags(tags.filter(t => t !== tag))
  }

  function addSecondaryPrize() {
    const nextPlace = secondaryPrizes.length + 2
    setSecondaryPrizes([...secondaryPrizes, { place: nextPlace, prize: '', value: 0 }])
  }

  function updateSecondaryPrize(index: number, field: 'prize' | 'value', value: string | number) {
    const updated = [...secondaryPrizes]
    updated[index] = { ...updated[index], [field]: value }
    setSecondaryPrizes(updated)
  }

  function removeSecondaryPrize(index: number) {
    setSecondaryPrizes(secondaryPrizes.filter((_, i) => i !== index))
  }

  function validateStep(step: Step): boolean {
    switch (step) {
      case 1:
        return title.trim() !== '' && description.trim() !== ''
      case 2:
        return prizeDescription.trim() !== '' && parseFloat(prizeValue) > 0
      case 3:
        return parseInt(totalTickets) > 0 && parseFloat(ticketPrice) >= 1
      case 4:
        return true
      default:
        return false
    }
  }

  function nextStep() {
    if (validateStep(currentStep)) {
      setCurrentStep((currentStep + 1) as Step)
    }
  }

  function prevStep() {
    setCurrentStep((currentStep - 1) as Step)
  }

  async function handleSubmit() {
    if (!user || !validateStep(4)) return

    setSubmitting(true)

    try {
      const raffleData = {
        creator_id: user.id,
        title,
        description,
        emoji,
        prize_description: prizeDescription,
        prize_value: parseFloat(prizeValue),
        prize_currency: prizeCurrency,
        total_tickets: parseInt(totalTickets),
        base_ticket_price: parseFloat(ticketPrice),
        country: country || null,
        tags,
        secondary_prizes: secondaryPrizes.length > 0 ? JSON.stringify(secondaryPrizes) : '[]',
        escrow_type: userIsAdmin ? 'none' : escrowType,
        is_powered_by_onagui: userIsAdmin,
        has_deadline: hasDeadline,
        deadline: hasDeadline && deadline ? new Date(deadline).toISOString() : null,
        status: userIsAdmin ? 'active' : 'pending', // Admin raffles auto-approved
      }

      const { data, error } = await supabase
        .from('raffles')
        .insert(raffleData)
        .select()
        .single()

      if (error) throw error

      // TODO: Handle escrow payment for non-admin users
      if (!userIsAdmin && escrowType === 'full') {
        alert('Please complete the escrow payment of ' + prizeValue + ' USDC to activate your raffle.')
      }

      router.push(`/raffles/${data.id}`)
    } catch (error) {
      console.error('Error creating raffle:', error)
      alert('Failed to create raffle. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/raffles" className="text-blue-400 hover:text-blue-300 font-semibold">
              ← Back to Raffles
            </Link>
            <Link href="/">
              <h1 className="text-2xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                ONAGUI
              </h1>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Title */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black text-white mb-2">Create a Raffle</h2>
          <p className="text-slate-400">Set up your raffle and start selling tickets</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                    currentStep >= step
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {step}
                </div>
                {step < 4 && (
                  <div
                    className={`flex-1 h-1 mx-2 transition-all ${
                      currentStep > step ? 'bg-blue-600' : 'bg-slate-800'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm text-slate-400">
            <span>Basic Info</span>
            <span>Prize Details</span>
            <span>Tickets</span>
            <span>Review</span>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-slate-900/50 backdrop-blur-xl border-2 border-slate-800 rounded-3xl p-8">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-white mb-6">Basic Information</h3>

              <div>
                <label className="block text-sm font-semibold text-slate-400 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Win a 2026 Tesla Model S"
                  maxLength={100}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-400 mb-2">
                  Description *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your raffle and what makes it special..."
                  rows={5}
                  maxLength={1000}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-400 mb-2">
                  Emoji
                </label>
                <input
                  type="text"
                  value={emoji}
                  onChange={(e) => setEmoji(e.target.value)}
                  placeholder="🎟️"
                  maxLength={2}
                  className="w-32 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-4xl text-center focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-400 mb-2">
                  Country (Optional)
                </label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="e.g., USA, UK, Morocco"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-400 mb-2">
                  Tags
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    placeholder="Add tags (press Enter)"
                    className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={addTag}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <div
                      key={tag}
                      className="px-3 py-1 bg-slate-800 rounded-full text-sm text-slate-300 flex items-center gap-2"
                    >
                      #{tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="text-red-400 hover:text-red-300"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Prize Details */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-white mb-6">Prize Details</h3>

              <div>
                <label className="block text-sm font-semibold text-slate-400 mb-2">
                  Prize Description *
                </label>
                <textarea
                  value={prizeDescription}
                  onChange={(e) => setPrizeDescription(e.target.value)}
                  placeholder="Detailed description of the prize..."
                  rows={5}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-400 mb-2">
                    Prize Value (USD) *
                  </label>
                  <input
                    type="number"
                    value={prizeValue}
                    onChange={(e) => setPrizeValue(e.target.value)}
                    placeholder="10000"
                    min="1"
                    step="0.01"
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-400 mb-2">
                    Currency
                  </label>
                  <select
                    value={prizeCurrency}
                    onChange={(e) => setPrizeCurrency(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="USDC">USDC</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
              </div>

              {!userIsAdmin && (
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/50 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">💰</div>
                    <div className="flex-1">
                      <h4 className="font-bold text-yellow-400 mb-1">Escrow Required</h4>
                      <p className="text-sm text-slate-300">
                        You'll need to deposit ${prizeValue || '0'} USDC in escrow to publish this raffle.
                        Funds are locked until the winner confirms receipt.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Ticket Configuration */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-white mb-6">Ticket Configuration</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-400 mb-2">
                    Total Tickets *
                  </label>
                  <input
                    type="number"
                    value={totalTickets}
                    onChange={(e) => setTotalTickets(e.target.value)}
                    placeholder="10000"
                    min="10"
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-400 mb-2">
                    Price per Ticket (USDC) *
                  </label>
                  <input
                    type="number"
                    value={ticketPrice}
                    onChange={(e) => setTicketPrice(e.target.value)}
                    placeholder="1.00"
                    min="1"
                    step="0.01"
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  <p className="text-xs text-slate-500 mt-1">Minimum: $1.00 USDC</p>
                </div>
              </div>

              {totalTickets && ticketPrice && (
                <div className="p-4 bg-blue-500/10 border border-blue-500/50 rounded-xl">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">Potential Revenue:</span>
                    <span className="text-2xl font-bold text-blue-400">
                      ${(parseInt(totalTickets) * parseFloat(ticketPrice)).toLocaleString()} USDC
                    </span>
                  </div>
                </div>
              )}

              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasDeadline}
                    onChange={(e) => setHasDeadline(e.target.checked)}
                    className="w-5 h-5"
                  />
                  <span className="text-white font-semibold">Set a deadline (optional)</span>
                </label>
                <p className="text-sm text-slate-400 mt-1 ml-8">
                  If not set, raffle continues until all tickets are sold
                </p>
              </div>

              {hasDeadline && (
                <div>
                  <label className="block text-sm font-semibold text-slate-400 mb-2">
                    Deadline
                  </label>
                  <input
                    type="datetime-local"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}
            </div>
          )}

          {/* Step 4: Optional Features */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-white mb-6">Optional Features</h3>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-bold text-white mb-1">Secondary Prizes</h4>
                    <p className="text-sm text-slate-400">Add consolation prizes to boost participation</p>
                  </div>
                  <button
                    onClick={addSecondaryPrize}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg"
                  >
                    + Add Prize
                  </button>
                </div>

                {secondaryPrizes.map((prize, index) => (
                  <div key={index} className="p-4 bg-slate-800 rounded-xl mb-3">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-yellow-400 font-bold">#{prize.place} Place</span>
                      <button
                        onClick={() => removeSecondaryPrize(index)}
                        className="ml-auto text-red-400 hover:text-red-300"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={prize.prize}
                        onChange={(e) => updateSecondaryPrize(index, 'prize', e.target.value)}
                        placeholder="Prize description"
                        className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                      <input
                        type="number"
                        value={prize.value}
                        onChange={(e) => updateSecondaryPrize(index, 'value', parseFloat(e.target.value))}
                        placeholder="Value (USDC)"
                        min="0"
                        step="0.01"
                        className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="p-6 bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border-2 border-blue-500/50 rounded-xl">
                <h4 className="font-bold text-white mb-4">Raffle Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Title:</span>
                    <span className="text-white font-semibold">{title || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Prize Value:</span>
                    <span className="text-white font-semibold">${prizeValue || '0'} {prizeCurrency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Tickets:</span>
                    <span className="text-white font-semibold">{totalTickets || '0'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Ticket Price:</span>
                    <span className="text-white font-semibold">${ticketPrice || '0'} USDC</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Secondary Prizes:</span>
                    <span className="text-white font-semibold">{secondaryPrizes.length}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-700">
                    <span className="text-slate-400">Potential Revenue:</span>
                    <span className="text-green-400 font-bold text-lg">
                      ${totalTickets && ticketPrice ? (parseInt(totalTickets) * parseFloat(ticketPrice)).toLocaleString() : '0'}
                    </span>
                  </div>
                </div>
              </div>

              {userIsAdmin && (
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">⚡</span>
                    <div>
                      <h4 className="font-bold text-yellow-400">Admin Raffle</h4>
                      <p className="text-sm text-slate-300">
                        This raffle will be marked as "Powered by Onagui" and auto-approved
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-slate-800">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all"
            >
              Previous
            </button>

            {currentStep < 4 ? (
              <button
                onClick={nextStep}
                disabled={!validateStep(currentStep)}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting || !validateStep(4)}
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-slate-700 disabled:to-slate-700 text-white font-bold rounded-xl transition-all"
              >
                {submitting ? 'Creating...' : userIsAdmin ? 'Create & Publish' : 'Create Raffle'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
