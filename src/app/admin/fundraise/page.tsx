'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { isAdmin } from '@/lib/admin'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type Fundraiser = {
  id: string
  title: string
  description: string
  story?: string
  goal_amount: number
  raised_amount: number
  currency: string
  status: string
  category: string
  creator_id: string
  user_id?: string
  creator_email?: string
  creator_name?: string
  created_at: string
  end_date: string
  ends_at?: string
  donor_count: number
  total_donors?: number
  platform_fees: number
  payout_status: string
  kyc_verified: boolean
  compliance_status: string
  compliance_notes: string
  wallet_address: string
}

export default function AdminFundraise() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [fundraisers, setFundraisers] = useState<Fundraiser[]>([])
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [selectedFundraiser, setSelectedFundraiser] = useState<Fundraiser | null>(null)
  const [complianceNotes, setComplianceNotes] = useState('')
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    paused: 0,
    completed: 0,
    rejected: 0,
    totalRaised: 0,
    platformFees: 0,
    pendingReview: 0,
  })

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (!loading) fetchFundraisers()
  }, [filter])

  async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user || !isAdmin(session.user.email)) {
      router.push('/')
      return
    }
    await fetchStats()
    await fetchFundraisers()
    setLoading(false)
  }

  async function fetchStats() {
    try {
      const { count: total } = await supabase.from('fundraisers').select('*', { count: 'exact', head: true })
      const { count: active } = await supabase.from('fundraisers').select('*', { count: 'exact', head: true }).eq('status', 'active')
      const { count: pending } = await supabase.from('fundraisers').select('*', { count: 'exact', head: true }).eq('status', 'pending')
      const { count: paused } = await supabase.from('fundraisers').select('*', { count: 'exact', head: true }).eq('status', 'paused')
      const { count: completed } = await supabase.from('fundraisers').select('*', { count: 'exact', head: true }).eq('status', 'completed')
      const { count: rejected } = await supabase.from('fundraisers').select('*', { count: 'exact', head: true }).eq('status', 'rejected')

      const { data: allFundraisers } = await supabase.from('fundraisers').select('raised_amount, platform_fees')
      const totalRaised = allFundraisers?.reduce((sum, f) => sum + (f.raised_amount || 0), 0) || 0
      const platformFees = allFundraisers?.reduce((sum, f) => sum + (f.platform_fees || 0), 0) || 0

      const { count: pendingReview } = await supabase.from('fundraisers').select('*', { count: 'exact', head: true }).eq('compliance_status', 'pending_review')

      setStats({
        total: total || 0,
        active: active || 0,
        pending: pending || 0,
        paused: paused || 0,
        completed: completed || 0,
        rejected: rejected || 0,
        totalRaised,
        platformFees,
        pendingReview: pendingReview || 0,
      })
    } catch (error) {
      console.error('Error fetching fundraise stats:', error)
    }
  }

  async function fetchFundraisers() {
    try {
      let query = supabase
        .from('fundraisers')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)

      if (filter !== 'all') query = query.eq('status', filter)

      const { data, error } = await query
      if (error) throw error

      const creatorIds = Array.from(
        new Set(
          (data || [])
            .map((item: any) => item.user_id || item.creator_id)
            .filter(Boolean)
        )
      )

      let profileById = new Map<string, { email?: string; full_name?: string }>()

      if (creatorIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, email, full_name')
          .in('id', creatorIds)

        if (profilesError) {
          console.error('Error fetching fundraiser creator profiles:', profilesError)
        } else {
          profileById = new Map(
            (profilesData || []).map((profile: any) => [profile.id, profile])
          )
        }
      }

      const mapped = (data || []).map((item: any) => ({
        ...item,
        creator_id: item.creator_id || item.user_id,
        creator_email: profileById.get(item.user_id || item.creator_id)?.email || 'Unknown',
        creator_name: profileById.get(item.user_id || item.creator_id)?.full_name || 'Unknown',
        description: item.description || item.story || '',
        donor_count: item.donor_count ?? item.total_donors ?? 0,
        end_date: item.end_date || item.ends_at || '',
      }))

      setFundraisers(mapped)
    } catch (error) {
      console.error('Error fetching fundraisers:', error)
    }
  }

  async function updateStatus(id: string, status: string) {
    setActionLoading(id)
    try {
      const { error } = await supabase
        .from('fundraisers')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error
      await fetchFundraisers()
      await fetchStats()
    } catch (error) {
      console.error('Error updating fundraiser:', error)
      alert('Failed to update fundraiser')
    }
    setActionLoading(null)
  }

  async function updateCompliance(id: string, complianceStatus: string, notes: string) {
    setActionLoading(id)
    try {
      const { error } = await supabase
        .from('fundraisers')
        .update({
          compliance_status: complianceStatus,
          compliance_notes: notes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (error) throw error
      await fetchFundraisers()
      await fetchStats()
      setSelectedFundraiser(null)
      setComplianceNotes('')
    } catch (error) {
      console.error('Error updating compliance:', error)
      alert('Failed to update compliance status')
    }
    setActionLoading(null)
  }

  async function deleteFundraiser(id: string) {
    if (!confirm('Are you sure? This will permanently delete this fundraiser and all its donations.')) return
    setActionLoading(id)
    try {
      const { error } = await supabase.from('fundraisers').delete().eq('id', id)
      if (error) throw error
      await fetchFundraisers()
      await fetchStats()
      setSelectedFundraiser(null)
    } catch (error) {
      console.error('Error deleting fundraiser:', error)
      alert('Failed to delete fundraiser')
    }
    setActionLoading(null)
  }

  const filteredFundraisers = fundraisers.filter(f =>
    f.title?.toLowerCase().includes(search.toLowerCase()) ||
    f.creator_email?.toLowerCase().includes(search.toLowerCase()) ||
    f.creator_name?.toLowerCase().includes(search.toLowerCase())
  )

  const statusColor: Record<string, string> = {
    active: 'text-green-400 bg-green-500/20 border-green-500/50',
    pending: 'text-orange-400 bg-orange-500/20 border-orange-500/50',
    paused: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/50',
    completed: 'text-blue-400 bg-blue-500/20 border-blue-500/50',
    rejected: 'text-red-400 bg-red-500/20 border-red-500/50',
  }

  const complianceColor: Record<string, string> = {
    approved: 'text-green-400',
    pending_review: 'text-orange-400',
    flagged: 'text-red-400',
    rejected: 'text-red-400',
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
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-slate-400 hover:text-white transition-colors">← Back to Admin</Link>
            <div className="px-4 py-1 bg-gradient-to-r from-pink-500/20 to-rose-500/20 border border-pink-500/50 rounded-full">
              <span className="text-pink-400 font-bold text-sm">💝 FUNDRAISE</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-4xl font-black text-white mb-2">Fundraise Management</h2>
        <p className="text-slate-400 mb-8">Review campaigns, verify legitimacy, manage compliance, and approve payouts</p>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 text-center">
            <div className="text-2xl font-black text-white">{stats.total}</div>
            <div className="text-xs text-slate-400">Total</div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 text-center">
            <div className="text-2xl font-black text-green-400">{stats.active}</div>
            <div className="text-xs text-slate-400">Active</div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 text-center">
            <div className="text-2xl font-black text-orange-400">{stats.pending}</div>
            <div className="text-xs text-slate-400">Pending</div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 text-center">
            <div className="text-2xl font-black text-yellow-400">${stats.totalRaised.toFixed(0)}</div>
            <div className="text-xs text-slate-400">Total Raised</div>
          </div>
          <div className="bg-gradient-to-br from-red-900/30 to-orange-900/30 border-2 border-red-500/50 rounded-2xl p-4 text-center">
            <div className="text-2xl font-black text-red-400">{stats.pendingReview}</div>
            <div className="text-xs text-red-400 font-semibold">Needs Review</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          {['all', 'active', 'pending', 'paused', 'completed', 'rejected'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${filter === f ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="mb-6">
          <input type="text" placeholder="Search by title, creator name, or email..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500" />
        </div>

        {/* Table */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="px-4 py-3 text-left text-xs text-slate-400 font-semibold">Campaign</th>
                  <th className="px-4 py-3 text-left text-xs text-slate-400 font-semibold">Creator</th>
                  <th className="px-4 py-3 text-left text-xs text-slate-400 font-semibold">Progress</th>
                  <th className="px-4 py-3 text-left text-xs text-slate-400 font-semibold">Status</th>
                  <th className="px-4 py-3 text-left text-xs text-slate-400 font-semibold">Compliance</th>
                  <th className="px-4 py-3 text-left text-xs text-slate-400 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFundraisers.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-500">No fundraisers found</td></tr>
                ) : (
                  filteredFundraisers.map((f) => {
                    const progress = f.goal_amount > 0 ? Math.min((f.raised_amount / f.goal_amount) * 100, 100) : 0
                    return (
                      <tr key={f.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                        <td className="px-4 py-3">
                          <div className="text-white font-semibold text-sm">{f.title || 'Untitled'}</div>
                          <div className="text-slate-500 text-xs">{f.category || 'No category'}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-white text-sm">{f.creator_name}</div>
                          <div className="text-slate-500 text-xs">{f.creator_email}</div>
                          {f.kyc_verified && <span className="text-green-400 text-xs">✓ KYC Verified</span>}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-yellow-400 font-bold text-sm">${f.raised_amount?.toFixed(0)} / ${f.goal_amount?.toFixed(0)}</div>
                          <div className="w-24 h-2 bg-slate-700 rounded-full mt-1">
                            <div className="h-full bg-green-500 rounded-full" style={{ width: `${progress}%` }}></div>
                          </div>
                          <div className="text-slate-500 text-xs mt-1">{f.donor_count || 0} donors</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-lg text-xs font-bold border ${statusColor[f.status] || 'text-slate-400'}`}>
                            {f.status?.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-bold ${complianceColor[f.compliance_status] || 'text-slate-500'}`}>
                            {f.compliance_status ? f.compliance_status.replace('_', ' ').toUpperCase() : 'NOT REVIEWED'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            {f.status === 'pending' && (
                              <button onClick={() => updateStatus(f.id, 'active')} disabled={actionLoading === f.id}
                                className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-xs font-bold hover:bg-green-500/30">Approve</button>
                            )}
                            {f.status === 'active' && (
                              <button onClick={() => updateStatus(f.id, 'paused')} disabled={actionLoading === f.id}
                                className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-lg text-xs font-bold hover:bg-yellow-500/30">Pause</button>
                            )}
                            {f.status === 'paused' && (
                              <button onClick={() => updateStatus(f.id, 'active')} disabled={actionLoading === f.id}
                                className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-xs font-bold hover:bg-green-500/30">Resume</button>
                            )}
                            <button onClick={() => { setSelectedFundraiser(f); setComplianceNotes(f.compliance_notes || '') }}
                              className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-xs font-bold hover:bg-blue-500/30">Review</button>
                            <button onClick={() => updateStatus(f.id, 'rejected')} disabled={actionLoading === f.id}
                              className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-xs font-bold hover:bg-red-500/30">Reject</button>
                            <button onClick={() => deleteFundraiser(f.id)} disabled={actionLoading === f.id}
                              className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-xs font-bold hover:bg-red-500/30">Delete</button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Compliance Review Modal */}
      {selectedFundraiser && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedFundraiser(null)}>
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Compliance Review</h3>
              <button onClick={() => setSelectedFundraiser(null)} className="text-slate-400 hover:text-white text-2xl">✕</button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <div className="text-xs text-slate-500 mb-1">Campaign Title</div>
                <div className="text-white font-semibold text-lg">{selectedFundraiser.title}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">Description</div>
                <div className="text-slate-300 text-sm max-h-32 overflow-y-auto">{selectedFundraiser.description || 'No description'}</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-slate-500 mb-1">Creator</div>
                  <div className="text-white">{selectedFundraiser.creator_name}</div>
                  <div className="text-slate-500 text-xs">{selectedFundraiser.creator_email}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">KYC Status</div>
                  <div className={selectedFundraiser.kyc_verified ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
                    {selectedFundraiser.kyc_verified ? '✓ Verified' : '✗ Not Verified'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Goal</div>
                  <div className="text-yellow-400 font-bold">${selectedFundraiser.goal_amount?.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Raised</div>
                  <div className="text-green-400 font-bold">${selectedFundraiser.raised_amount?.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Wallet Address</div>
                  <div className="text-white text-xs font-mono break-all">{selectedFundraiser.wallet_address || 'Not provided'}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">End Date</div>
                  <div className="text-white">{selectedFundraiser.end_date ? new Date(selectedFundraiser.end_date).toLocaleDateString() : 'No end date'}</div>
                </div>
              </div>
            </div>

            {/* Compliance Notes */}
            <div className="mb-6">
              <label className="text-sm text-slate-400 mb-2 block">Compliance Notes</label>
              <textarea
                value={complianceNotes}
                onChange={(e) => setComplianceNotes(e.target.value)}
                placeholder="Add notes about legitimacy, legal review, documents checked..."
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 h-32 resize-none"
              />
            </div>

            {/* Compliance Actions */}
            <div className="flex gap-3 flex-wrap">
              <button onClick={() => updateCompliance(selectedFundraiser.id, 'approved', complianceNotes)}
                disabled={actionLoading === selectedFundraiser.id}
                className="px-6 py-3 bg-green-500 text-white rounded-xl font-bold text-sm hover:bg-green-600 transition-all">
                ✓ Approve Compliance
              </button>
              <button onClick={() => updateCompliance(selectedFundraiser.id, 'flagged', complianceNotes)}
                disabled={actionLoading === selectedFundraiser.id}
                className="px-6 py-3 bg-orange-500 text-white rounded-xl font-bold text-sm hover:bg-orange-600 transition-all">
                ⚠ Flag for Review
              </button>
              <button onClick={() => updateCompliance(selectedFundraiser.id, 'rejected', complianceNotes)}
                disabled={actionLoading === selectedFundraiser.id}
                className="px-6 py-3 bg-red-500 text-white rounded-xl font-bold text-sm hover:bg-red-600 transition-all">
                ✗ Reject - Not Legal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
