'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { isAdmin } from '@/lib/admin'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type MarketplaceListing = {
  id: string
  title: string
  description: string
  price: number
  currency: string
  category: string
  condition: string
  status: string
  seller_id: string
  seller_email?: string
  seller_name?: string
  images: string[]
  created_at: string
  updated_at: string
  views: number
  featured: boolean
}

export default function AdminMarketplace() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [listings, setListings] = useState<MarketplaceListing[]>([])
  const [filter, setFilter] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [selectedListing, setSelectedListing] = useState<MarketplaceListing | null>(null)
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    suspended: 0,
    sold: 0,
    totalValue: 0,
  })

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (!loading) fetchListings()
  }, [filter])

  async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user || !isAdmin(session.user.email)) {
      router.push('/')
      return
    }
    await fetchStats()
    await fetchListings()
    setLoading(false)
  }

  async function fetchStats() {
    try {
      const { count: total } = await supabase.from('marketplace_listings').select('*', { count: 'exact', head: true })
      const { count: active } = await supabase.from('marketplace_listings').select('*', { count: 'exact', head: true }).eq('status', 'active')
      const { count: pending } = await supabase.from('marketplace_listings').select('*', { count: 'exact', head: true }).eq('status', 'pending')
      const { count: suspended } = await supabase.from('marketplace_listings').select('*', { count: 'exact', head: true }).eq('status', 'suspended')
      const { count: sold } = await supabase.from('marketplace_listings').select('*', { count: 'exact', head: true }).eq('status', 'sold')
      const { data: allListings } = await supabase.from('marketplace_listings').select('price')
      const totalValue = allListings?.reduce((sum, l) => sum + (l.price || 0), 0) || 0

      setStats({
        total: total || 0,
        active: active || 0,
        pending: pending || 0,
        suspended: suspended || 0,
        sold: sold || 0,
        totalValue,
      })
    } catch (error) {
      console.error('Error fetching marketplace stats:', error)
    }
  }

  async function fetchListings() {
    try {
      let query = supabase
        .from('marketplace_listings')
        .select('*, profiles:seller_id(email, full_name)')
        .order('created_at', { ascending: false })
        .limit(100)

      if (filter !== 'all') {
        query = query.eq('status', filter)
      }

      const { data, error } = await query
      if (error) throw error

      const mapped = (data || []).map((item: any) => ({
        ...item,
        seller_email: item.profiles?.email || 'Unknown',
        seller_name: item.profiles?.full_name || 'Unknown',
      }))

      setListings(mapped)
    } catch (error) {
      console.error('Error fetching listings:', error)
    }
  }

  async function updateListingStatus(id: string, status: string) {
    setActionLoading(id)
    try {
      const { error } = await supabase
        .from('marketplace_listings')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error
      await fetchListings()
      await fetchStats()
    } catch (error) {
      console.error('Error updating listing:', error)
      alert('Failed to update listing')
    }
    setActionLoading(null)
  }

  async function deleteListing(id: string) {
    if (!confirm('Are you sure you want to permanently delete this listing?')) return
    setActionLoading(id)
    try {
      const { error } = await supabase.from('marketplace_listings').delete().eq('id', id)
      if (error) throw error
      await fetchListings()
      await fetchStats()
      setSelectedListing(null)
    } catch (error) {
      console.error('Error deleting listing:', error)
      alert('Failed to delete listing')
    }
    setActionLoading(null)
  }

  async function toggleFeatured(id: string, current: boolean) {
    setActionLoading(id)
    try {
      const { error } = await supabase
        .from('marketplace_listings')
        .update({ featured: !current })
        .eq('id', id)

      if (error) throw error
      await fetchListings()
    } catch (error) {
      console.error('Error toggling featured:', error)
    }
    setActionLoading(null)
  }

  const filteredListings = listings.filter(l =>
    l.title?.toLowerCase().includes(search.toLowerCase()) ||
    l.seller_email?.toLowerCase().includes(search.toLowerCase()) ||
    l.seller_name?.toLowerCase().includes(search.toLowerCase())
  )

  const statusColor: Record<string, string> = {
    active: 'text-green-400 bg-green-500/20 border-green-500/50',
    pending: 'text-orange-400 bg-orange-500/20 border-orange-500/50',
    suspended: 'text-red-400 bg-red-500/20 border-red-500/50',
    sold: 'text-blue-400 bg-blue-500/20 border-blue-500/50',
    removed: 'text-slate-400 bg-slate-500/20 border-slate-500/50',
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
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="text-slate-400 hover:text-white transition-colors">
                ← Back to Admin
              </Link>
              <div className="px-4 py-1 bg-gradient-to-r from-teal-500/20 to-cyan-500/20 border border-teal-500/50 rounded-full">
                <span className="text-teal-400 font-bold text-sm">🏪 MARKETPLACE</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-4xl font-black text-white mb-2">Marketplace Management</h2>
        <p className="text-slate-400 mb-8">Review, approve, suspend, and manage all marketplace listings</p>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
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
            <div className="text-2xl font-black text-red-400">{stats.suspended}</div>
            <div className="text-xs text-slate-400">Suspended</div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 text-center">
            <div className="text-2xl font-black text-blue-400">{stats.sold}</div>
            <div className="text-xs text-slate-400">Sold</div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 text-center">
            <div className="text-2xl font-black text-yellow-400">${stats.totalValue.toFixed(0)}</div>
            <div className="text-xs text-slate-400">Total Value</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          {['all', 'active', 'pending', 'suspended', 'sold', 'removed'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                filter === f
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by title, seller name, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Listings Table */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="px-4 py-3 text-left text-xs text-slate-400 font-semibold">Listing</th>
                  <th className="px-4 py-3 text-left text-xs text-slate-400 font-semibold">Seller</th>
                  <th className="px-4 py-3 text-left text-xs text-slate-400 font-semibold">Price</th>
                  <th className="px-4 py-3 text-left text-xs text-slate-400 font-semibold">Status</th>
                  <th className="px-4 py-3 text-left text-xs text-slate-400 font-semibold">Date</th>
                  <th className="px-4 py-3 text-left text-xs text-slate-400 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredListings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                      No listings found
                    </td>
                  </tr>
                ) : (
                  filteredListings.map((listing) => (
                    <tr key={listing.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-slate-800 rounded-lg overflow-hidden flex-shrink-0">
                            {listing.images?.[0] ? (
                              <img src={listing.images[0]} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-600">🖼️</div>
                            )}
                          </div>
                          <div>
                            <div className="text-white font-semibold text-sm">{listing.title || 'Untitled'}</div>
                            <div className="text-slate-500 text-xs">{listing.category || 'No category'} • {listing.condition || 'N/A'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-white text-sm">{listing.seller_name}</div>
                        <div className="text-slate-500 text-xs">{listing.seller_email}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-yellow-400 font-bold text-sm">
                          ${listing.price?.toFixed(2)} {listing.currency || ''}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-lg text-xs font-bold border ${statusColor[listing.status] || 'text-slate-400'}`}>
                          {listing.status?.toUpperCase()}
                        </span>
                        {listing.featured && (
                          <span className="ml-2 px-2 py-1 rounded-lg text-xs font-bold text-yellow-400 bg-yellow-500/20 border border-yellow-500/50">
                            ⭐ FEATURED
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-xs">
                        {new Date(listing.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {listing.status === 'pending' && (
                            <button
                              onClick={() => updateListingStatus(listing.id, 'active')}
                              disabled={actionLoading === listing.id}
                              className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-xs font-bold hover:bg-green-500/30 transition-all"
                            >
                              Approve
                            </button>
                          )}
                          {listing.status === 'active' && (
                            <button
                              onClick={() => updateListingStatus(listing.id, 'suspended')}
                              disabled={actionLoading === listing.id}
                              className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-xs font-bold hover:bg-red-500/30 transition-all"
                            >
                              Suspend
                            </button>
                          )}
                          {listing.status === 'suspended' && (
                            <button
                              onClick={() => updateListingStatus(listing.id, 'active')}
                              disabled={actionLoading === listing.id}
                              className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-xs font-bold hover:bg-green-500/30 transition-all"
                            >
                              Reactivate
                            </button>
                          )}
                          <button
                            onClick={() => toggleFeatured(listing.id, listing.featured)}
                            disabled={actionLoading === listing.id}
                            className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-lg text-xs font-bold hover:bg-yellow-500/30 transition-all"
                          >
                            {listing.featured ? 'Unfeature' : 'Feature'}
                          </button>
                          <button
                            onClick={() => setSelectedListing(listing)}
                            className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-xs font-bold hover:bg-blue-500/30 transition-all"
                          >
                            View
                          </button>
                          <button
                            onClick={() => deleteListing(listing.id)}
                            disabled={actionLoading === listing.id}
                            className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-xs font-bold hover:bg-red-500/30 transition-all"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedListing && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedListing(null)}>
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Listing Details</h3>
              <button onClick={() => setSelectedListing(null)} className="text-slate-400 hover:text-white text-2xl">✕</button>
            </div>
            <div className="space-y-4">
              <div>
                <div className="text-xs text-slate-500 mb-1">Title</div>
                <div className="text-white font-semibold">{selectedListing.title}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">Description</div>
                <div className="text-slate-300 text-sm">{selectedListing.description || 'No description'}</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-slate-500 mb-1">Price</div>
                  <div className="text-yellow-400 font-bold">${selectedListing.price?.toFixed(2)} {selectedListing.currency}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Category</div>
                  <div className="text-white">{selectedListing.category || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Condition</div>
                  <div className="text-white">{selectedListing.condition || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Status</div>
                  <div className={`inline-block px-2 py-1 rounded-lg text-xs font-bold border ${statusColor[selectedListing.status]}`}>
                    {selectedListing.status?.toUpperCase()}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Seller</div>
                  <div className="text-white">{selectedListing.seller_name} ({selectedListing.seller_email})</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Views</div>
                  <div className="text-white">{selectedListing.views || 0}</div>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                {selectedListing.status !== 'active' && (
                  <button onClick={() => { updateListingStatus(selectedListing.id, 'active'); setSelectedListing(null) }}
                    className="px-4 py-2 bg-green-500 text-white rounded-xl font-bold text-sm hover:bg-green-600 transition-all">
                    Approve / Activate
                  </button>
                )}
                {selectedListing.status !== 'suspended' && (
                  <button onClick={() => { updateListingStatus(selectedListing.id, 'suspended'); setSelectedListing(null) }}
                    className="px-4 py-2 bg-orange-500 text-white rounded-xl font-bold text-sm hover:bg-orange-600 transition-all">
                    Suspend
                  </button>
                )}
                <button onClick={() => deleteListing(selectedListing.id)}
                  className="px-4 py-2 bg-red-500 text-white rounded-xl font-bold text-sm hover:bg-red-600 transition-all">
                  Delete Permanently
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
