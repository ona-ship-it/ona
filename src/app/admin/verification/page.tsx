'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { isAdmin } from '@/lib/admin'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type VerificationType = 'winners' | 'creators' | 'fundraisers' | 'kyc'

type VerificationItem = {
  id: string
  user_id: string
  email?: string
  full_name?: string
  type: string
  status: string
  submitted_at: string
  reviewed_at?: string
  notes?: string
  documents?: string[]
  giveaway_title?: string
  prize_value?: number
  total_posts?: number
  trust_score?: number
  campaign_title?: string
  goal_amount?: number
  raised_amount?: number
  document_type?: string
  country?: string
}

export default function AdminVerification() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<VerificationType>('winners')
  const [items, setItems] = useState<VerificationItem[]>([])
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<VerificationItem | null>(null)
  const [reviewNotes, setReviewNotes] = useState('')
  const [stats, setStats] = useState({
    pendingWinners: 0,
    pendingCreators: 0,
    pendingFundraisers: 0,
    pendingKYC: 0,
    totalVerified: 0,
    totalFlagged: 0,
  })

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (!loading) fetchItems()
  }, [activeTab, filter])

  async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user || !isAdmin(session.user.email)) {
      router.push('/')
      return
    }
    await fetchStats()
    await fetchItems()
    setLoading(false)
  }

  async function fetchStats() {
    try {
      const { count: pendingWinners } = await supabase
        .from('giveaways')
        .select('*', { count: 'exact', head: true })
        .not('winner_id', 'is', null)
        .eq('winner_verified', false)

      const { count: pendingKYC } = await supabase
        .from('kyc_submissions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')

      const { count: pendingFundraisers } = await supabase
        .from('fundraisers')
        .select('*', { count: 'exact', head: true })
        .in('compliance_status', ['pending_review', 'flagged'])

      const { count: totalVerified } = await supabase
        .from('kyc_submissions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved')

      const { count: totalFlagged } = await supabase
        .from('kyc_submissions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'flagged')

      setStats({
        pendingWinners: pendingWinners || 0,
        pendingCreators: 0,
        pendingFundraisers: pendingFundraisers || 0,
        pendingKYC: pendingKYC || 0,
        totalVerified: totalVerified || 0,
        totalFlagged: totalFlagged || 0,
      })
    } catch (error) {
      console.error('Error fetching verification stats:', error)
    }
  }

  async function fetchItems() {
    try {
      let data: any[] = []

      if (activeTab === 'winners') {
        let query = supabase
          .from('giveaways')
          .select('*, winner:winner_id(email, full_name), creator:creator_id(email, full_name)')
          .not('winner_id', 'is', null)
          .order('created_at', { ascending: false })
          .limit(100)

        if (filter === 'pending') query = query.eq('winner_verified', false)
        if (filter === 'verified') query = query.eq('winner_verified', true)

        const { data: giveaways, error } = await query
        if (error) throw error

        data = (giveaways || []).map((g: any) => ({
          id: g.id,
          user_id: g.winner_id,
          email: g.winner?.email || 'Unknown',
          full_name: g.winner?.full_name || 'Unknown',
          type: 'winner',
          status: g.winner_verified ? 'verified' : 'pending',
          submitted_at: g.created_at,
          giveaway_title: g.title,
          prize_value: g.entry_price || 0,
        }))

      } else if (activeTab === 'creators') {
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100)

        if (error) throw error

        data = (profiles || []).map((p: any) => ({
          id: p.id,
          user_id: p.id,
          email: p.email || 'Unknown',
          full_name: p.full_name || 'Unknown',
          type: 'creator',
          status: p.verified ? 'verified' : 'pending',
          submitted_at: p.created_at,
        }))

      } else if (activeTab === 'fundraisers') {
        let query = supabase
          .from('fundraisers')
          .select('*, profiles:creator_id(email, full_name)')
          .order('created_at', { ascending: false })
          .limit(100)

        if (filter === 'pending') query = query.in('compliance_status', ['pending_review', 'flagged'])
        if (filter === 'verified') query = query.eq('compliance_status', 'approved')
        if (filter === 'rejected') query = query.eq('compliance_status', 'rejected')

        const { data: fundraisers, error } = await query
        if (error) throw error

        data = (fundraisers || []).map((f: any) => ({
          id: f.id,
          user_id: f.creator_id,
          email: f.profiles?.email || 'Unknown',
          full_name: f.profiles?.full_name || 'Unknown',
          type: 'fundraiser',
          status: f.compliance_status || 'pending_review',
          submitted_at: f.created_at,
          campaign_title: f.title,
          goal_amount: f.goal_amount,
          raised_amount: f.raised_amount,
          notes: f.compliance_notes,
        }))

      } else if (activeTab === 'kyc') {
        let query = supabase
          .from('kyc_submissions')
          .select('*, profiles:user_id(email, full_name)')
          .order('created_at', { ascending: false })
          .limit(100)

        if (filter !== 'all') query = query.eq('status', filter)

        const { data: submissions, error } = await query
        if (error) throw error

        data = (submissions || []).map((s: any) => ({
          id: s.id,
          user_id: s.user_id,
          email: s.profiles?.email || 'Unknown',
          full_name: s.profiles?.full_name || s.full_name || 'Unknown',
          type: 'kyc',
          status: s.status,
          submitted_at: s.created_at,
          reviewed_at: s.reviewed_at,
          notes: s.admin_notes,
          document_type: s.document_type,
          country: s.country,
          documents: s.document_urls || [],
        }))
      }

      setItems(data)
    } catch (error) {
      console.error('Error fetching items:', error)
      setItems([])
    }
  }

  async function verifyWinner(giveawayId: string, verified: boolean) {
    setActionLoading(giveawayId)
    try {
      const { error } = await supabase
        .from('giveaways')
        .update({ winner_verified: verified, updated_at: new Date().toISOString() })
        .eq('id', giveawayId)

      if (error) throw error
      await fetchItems()
      await fetchStats()
    } catch (error) {
      console.error('Error verifying winner:', error)
    }
    setActionLoading(null)
  }

  async function verifyCreator(userId: string, verified: boolean) {
    setActionLoading(userId)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ verified, updated_at: new Date().toISOString() })
        .eq('id', userId)

      if (error) throw error
      await fetchItems()
      await fetchStats()
    } catch (error) {
      console.error('Error verifying creator:', error)
    }
    setActionLoading(null)
  }

  async function updateFundraiserCompliance(id: string, complianceStatus: string) {
    setActionLoading(id)
    try {
      const { error } = await supabase
        .from('fundraisers')
        .update({
          compliance_status: complianceStatus,
          compliance_notes: reviewNotes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (error) throw error
      await fetchItems()
      await fetchStats()
      setSelectedItem(null)
      setReviewNotes('')
    } catch (error) {
      console.error('Error updating compliance:', error)
    }
    setActionLoading(null)
  }

  async function updateKYCStatus(id: string, status: string) {
    setActionLoading(id)
    try {
      const { error } = await supabase
        .from('kyc_submissions')
        .update({
          status,
          admin_notes: reviewNotes,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (error) throw error
      await fetchItems()
      await fetchStats()
      setSelectedItem(null)
      setReviewNotes('')
    } catch (error) {
      console.error('Error updating KYC:', error)
    }
    setActionLoading(null)
  }

  const filteredItems = items.filter(item =>
    item.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    item.email?.toLowerCase().includes(search.toLowerCase()) ||
    item.giveaway_title?.toLowerCase().includes(search.toLowerCase()) ||
    item.campaign_title?.toLowerCase().includes(search.toLowerCase())
  )

  const tabs: { key: VerificationType; label: string; icon: string; badge?: number }[] = [
    { key: 'winners', label: 'Winners', icon: '🏆', badge: stats.pendingWinners },
    { key: 'creators', label: 'Creators', icon: '👤', badge: stats.pendingCreators },
    { key: 'fundraisers', label: 'Fundraisers', icon: '💝', badge: stats.pendingFundraisers },
    { key: 'kyc', label: 'KYC Documents', icon: '📋', badge: stats.pendingKYC },
  ]

  const statusColor: Record<string, string> = {
    verified: 'text-green-400 bg-green-500/20 border-green-500/50',
    approved: 'text-green-400 bg-green-500/20 border-green-500/50',
    pending: 'text-orange-400 bg-orange-500/20 border-orange-500/50',
    pending_review: 'text-orange-400 bg-orange-500/20 border-orange-500/50',
    flagged: 'text-red-400 bg-red-500/20 border-red-500/50',
    rejected: 'text-red-400 bg-red-500/20 border-red-500/50',
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
            <div className="px-4 py-1 bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-500/50 rounded-full">
              <span className="text-emerald-400 font-bold text-sm">🛡️ VERIFICATION & COMPLIANCE</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-4xl font-black text-white mb-2">Verification & Compliance</h2>
        <p className="text-slate-400 mb-8">Verify winners, creators, fundraise campaigns, and KYC documents for legal compliance</p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-gradient-to-br from-orange-900/30 to-yellow-900/30 border-2 border-orange-500/50 rounded-2xl p-4 text-center">
            <div className="text-2xl font-black text-orange-400">{stats.pendingWinners}</div>
            <div className="text-xs text-orange-300">Pending Winners</div>
          </div>
          <div className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border-2 border-blue-500/50 rounded-2xl p-4 text-center">
            <div className="text-2xl font-black text-blue-400">{stats.pendingCreators}</div>
            <div className="text-xs text-blue-300">Pending Creators</div>
          </div>
          <div className="bg-gradient-to-br from-pink-900/30 to-rose-900/30 border-2 border-pink-500/50 rounded-2xl p-4 text-center">
            <div className="text-2xl font-black text-pink-400">{stats.pendingFundraisers}</div>
            <div className="text-xs text-pink-300">Pending Fundraisers</div>
          </div>
          <div className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border-2 border-purple-500/50 rounded-2xl p-4 text-center">
            <div className="text-2xl font-black text-purple-400">{stats.pendingKYC}</div>
            <div className="text-xs text-purple-300">Pending KYC</div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 text-center">
            <div className="text-2xl font-black text-green-400">{stats.totalVerified}</div>
            <div className="text-xs text-slate-400">Total Verified</div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 text-center">
            <div className="text-2xl font-black text-red-400">{stats.totalFlagged}</div>
            <div className="text-xs text-slate-400">Flagged</div>
          </div>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto">
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => { setActiveTab(tab.key); setFilter('all') }}
              className={`px-5 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-all relative ${
                activeTab === tab.key ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}>
              {tab.icon} {tab.label}
              {tab.badge && tab.badge > 0 ? (
                <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">{tab.badge}</span>
              ) : null}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 mb-4">
          {['all', 'pending', 'verified', 'rejected', 'flagged'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === f ? 'bg-blue-500/30 text-blue-400 border border-blue-500/50' : 'bg-slate-800/50 text-slate-500 hover:bg-slate-800'
              }`}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        <div className="mb-6">
          <input type="text" placeholder="Search by name, email, or title..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500" />
        </div>

        <div className="space-y-3">
          {filteredItems.length === 0 ? (
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center text-slate-500">
              No items found for this filter
            </div>
          ) : (
            filteredItems.map(item => (
              <div key={item.id} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="text-white font-semibold">{item.full_name}</div>
                      <span className={`px-2 py-0.5 rounded-lg text-xs font-bold border ${statusColor[item.status] || 'text-slate-400 bg-slate-500/20 border-slate-500/50'}`}>
                        {item.status?.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <div className="text-slate-500 text-xs">{item.email}</div>

                    {item.type === 'winner' && item.giveaway_title && (
                      <div className="text-slate-400 text-xs mt-1">Won: {item.giveaway_title} (${item.prize_value})</div>
                    )}
                    {item.type === 'fundraiser' && item.campaign_title && (
                      <div className="text-slate-400 text-xs mt-1">
                        Campaign: {item.campaign_title} — ${item.raised_amount?.toFixed(0)} / ${item.goal_amount?.toFixed(0)}
                      </div>
                    )}
                    {item.type === 'kyc' && (
                      <div className="text-slate-400 text-xs mt-1">
                        Document: {item.document_type || 'N/A'} • Country: {item.country || 'N/A'}
                      </div>
                    )}
                    {item.notes && (
                      <div className="text-slate-500 text-xs mt-1 italic">Notes: {item.notes}</div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {item.type === 'winner' && item.status !== 'verified' && (
                      <button onClick={() => verifyWinner(item.id, true)} disabled={actionLoading === item.id}
                        className="px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg text-xs font-bold hover:bg-green-500/30">
                        ✓ Verify Winner
                      </button>
                    )}
                    {item.type === 'winner' && item.status === 'verified' && (
                      <button onClick={() => verifyWinner(item.id, false)} disabled={actionLoading === item.id}
                        className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-xs font-bold hover:bg-red-500/30">
                        Revoke
                      </button>
                    )}

                    {item.type === 'creator' && item.status !== 'verified' && (
                      <button onClick={() => verifyCreator(item.user_id, true)} disabled={actionLoading === item.user_id}
                        className="px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg text-xs font-bold hover:bg-green-500/30">
                        ✓ Verify Creator
                      </button>
                    )}
                    {item.type === 'creator' && item.status === 'verified' && (
                      <button onClick={() => verifyCreator(item.user_id, false)} disabled={actionLoading === item.user_id}
                        className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-xs font-bold hover:bg-red-500/30">
                        Revoke
                      </button>
                    )}

                    {(item.type === 'fundraiser' || item.type === 'kyc') && (
                      <button onClick={() => { setSelectedItem(item); setReviewNotes(item.notes || '') }}
                        className="px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg text-xs font-bold hover:bg-blue-500/30">
                        📋 Review
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {selectedItem && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedItem(null)}>
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">
                {selectedItem.type === 'kyc' ? 'KYC Document Review' : 'Compliance Review'}
              </h3>
              <button onClick={() => setSelectedItem(null)} className="text-slate-400 hover:text-white text-2xl">✕</button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-slate-500 mb-1">Name</div>
                  <div className="text-white font-semibold">{selectedItem.full_name}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Email</div>
                  <div className="text-white">{selectedItem.email}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Current Status</div>
                  <span className={`px-2 py-1 rounded-lg text-xs font-bold border ${statusColor[selectedItem.status] || 'text-slate-400'}`}>
                    {selectedItem.status?.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Submitted</div>
                  <div className="text-white">{new Date(selectedItem.submitted_at).toLocaleDateString()}</div>
                </div>
              </div>

              {selectedItem.type === 'kyc' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Document Type</div>
                    <div className="text-white">{selectedItem.document_type || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Country</div>
                    <div className="text-white">{selectedItem.country || 'N/A'}</div>
                  </div>
                </div>
              )}

              {selectedItem.type === 'fundraiser' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Campaign</div>
                    <div className="text-white">{selectedItem.campaign_title}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Progress</div>
                    <div className="text-yellow-400 font-bold">${selectedItem.raised_amount?.toFixed(0)} / ${selectedItem.goal_amount?.toFixed(0)}</div>
                  </div>
                </div>
              )}

              {selectedItem.documents && selectedItem.documents.length > 0 && (
                <div>
                  <div className="text-xs text-slate-500 mb-2">Uploaded Documents</div>
                  <div className="space-y-2">
                    {selectedItem.documents.map((doc, i) => (
                      <a key={i} href={doc} target="_blank" rel="noopener noreferrer"
                        className="block px-4 py-2 bg-slate-800 rounded-lg text-blue-400 text-sm hover:bg-slate-700 transition-colors">
                        📎 Document {i + 1} - Click to view
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mb-6">
              <label className="text-sm text-slate-400 mb-2 block">Review Notes</label>
              <textarea value={reviewNotes} onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Add verification notes, compliance findings, legal observations..."
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 h-32 resize-none" />
            </div>

            <div className="flex gap-3 flex-wrap">
              {selectedItem.type === 'kyc' && (
                <>
                  <button onClick={() => updateKYCStatus(selectedItem.id, 'approved')} disabled={actionLoading === selectedItem.id}
                    className="px-6 py-3 bg-green-500 text-white rounded-xl font-bold text-sm hover:bg-green-600 transition-all">
                    ✓ Approve KYC
                  </button>
                  <button onClick={() => updateKYCStatus(selectedItem.id, 'flagged')} disabled={actionLoading === selectedItem.id}
                    className="px-6 py-3 bg-orange-500 text-white rounded-xl font-bold text-sm hover:bg-orange-600 transition-all">
                    ⚠ Flag
                  </button>
                  <button onClick={() => updateKYCStatus(selectedItem.id, 'rejected')} disabled={actionLoading === selectedItem.id}
                    className="px-6 py-3 bg-red-500 text-white rounded-xl font-bold text-sm hover:bg-red-600 transition-all">
                    ✗ Reject
                  </button>
                </>
              )}
              {selectedItem.type === 'fundraiser' && (
                <>
                  <button onClick={() => updateFundraiserCompliance(selectedItem.id, 'approved')} disabled={actionLoading === selectedItem.id}
                    className="px-6 py-3 bg-green-500 text-white rounded-xl font-bold text-sm hover:bg-green-600 transition-all">
                    ✓ Legal & Compliant
                  </button>
                  <button onClick={() => updateFundraiserCompliance(selectedItem.id, 'flagged')} disabled={actionLoading === selectedItem.id}
                    className="px-6 py-3 bg-orange-500 text-white rounded-xl font-bold text-sm hover:bg-orange-600 transition-all">
                    ⚠ Flag for Investigation
                  </button>
                  <button onClick={() => updateFundraiserCompliance(selectedItem.id, 'rejected')} disabled={actionLoading === selectedItem.id}
                    className="px-6 py-3 bg-red-500 text-white rounded-xl font-bold text-sm hover:bg-red-600 transition-all">
                    ✗ Not Legal - Reject
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
