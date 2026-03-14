'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { isAdmin } from '@/lib/admin'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type PostType = 'giveaway' | 'raffle' | 'fundraiser' | 'marketplace'

export default function AdminPosts() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<PostType>('giveaway')
  const [posts, setPosts] = useState<any[]>([])
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [search, setSearch] = useState('')

  const [newPost, setNewPost] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    goal_amount: '',
    currency: 'USDC',
    end_date: '',
    status: 'active',
    max_entries: '',
    ticket_price: '',
  })

  const tableMap: Record<PostType, string> = {
    giveaway: 'giveaways',
    raffle: 'raffles',
    fundraiser: 'fundraisers',
    marketplace: 'marketplace_listings',
  }

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (!loading) fetchPosts()
  }, [activeTab])

  async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user || !isAdmin(session.user.email)) {
      router.push('/')
      return
    }
    await fetchPosts()
    setLoading(false)
  }

  async function fetchPosts() {
    try {
      const table = tableMap[activeTab]
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) throw error
      setPosts(data || [])
    } catch (error) {
      console.error('Error fetching posts:', error)
      setPosts([])
    }
  }

  async function createPost() {
    setActionLoading('create')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) throw new Error('Not authenticated')

      const table = tableMap[activeTab]
      let insertData: any = {
        title: newPost.title,
        description: newPost.description,
        status: newPost.status,
        created_at: new Date().toISOString(),
      }

      if (activeTab === 'giveaway') {
        insertData = {
          ...insertData,
          creator_id: session.user.id,
          end_date: newPost.end_date || null,
          max_entries: newPost.max_entries ? parseInt(newPost.max_entries) : null,
          currency: newPost.currency,
          entry_price: newPost.price ? parseFloat(newPost.price) : 0,
        }
      } else if (activeTab === 'raffle') {
        insertData = {
          ...insertData,
          creator_id: session.user.id,
          end_date: newPost.end_date || null,
          ticket_price: newPost.ticket_price ? parseFloat(newPost.ticket_price) : 0,
          currency: newPost.currency,
        }
      } else if (activeTab === 'fundraiser') {
        insertData = {
          ...insertData,
          creator_id: session.user.id,
          goal_amount: newPost.goal_amount ? parseFloat(newPost.goal_amount) : 0,
          raised_amount: 0,
          currency: newPost.currency,
          end_date: newPost.end_date || null,
          category: newPost.category,
          compliance_status: 'approved',
          platform_fees: 0,
        }
      } else if (activeTab === 'marketplace') {
        insertData = {
          ...insertData,
          seller_id: session.user.id,
          price: newPost.price ? parseFloat(newPost.price) : 0,
          currency: newPost.currency,
          category: newPost.category,
          condition: 'new',
        }
      }

      const { error } = await supabase.from(table).insert(insertData)
      if (error) throw error

      await fetchPosts()
      setShowCreateModal(false)
      setNewPost({ title: '', description: '', category: '', price: '', goal_amount: '', currency: 'USDC', end_date: '', status: 'active', max_entries: '', ticket_price: '' })
      alert('Post created successfully (no escrow)')
    } catch (error) {
      console.error('Error creating post:', error)
      alert('Failed to create post: ' + (error as Error).message)
    }
    setActionLoading(null)
  }

  async function deletePost(id: string) {
    if (!confirm('Delete this post permanently? This bypasses escrow and cannot be undone.')) return
    setActionLoading(id)
    try {
      const table = tableMap[activeTab]
      const { error } = await supabase.from(table).delete().eq('id', id)
      if (error) throw error
      await fetchPosts()
    } catch (error) {
      console.error('Error deleting post:', error)
      alert('Failed to delete post')
    }
    setActionLoading(null)
  }

  async function forceUpdateStatus(id: string, status: string) {
    setActionLoading(id)
    try {
      const table = tableMap[activeTab]
      const { error } = await supabase.from(table).update({ status }).eq('id', id)
      if (error) throw error
      await fetchPosts()
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Failed to update')
    }
    setActionLoading(null)
  }

  const filteredPosts = posts.filter(p =>
    p.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase())
  )

  const tabs: { key: PostType; label: string; icon: string }[] = [
    { key: 'giveaway', label: 'Giveaways', icon: '🎁' },
    { key: 'raffle', label: 'Raffles', icon: '🎟️' },
    { key: 'fundraiser', label: 'Fundraisers', icon: '💝' },
    { key: 'marketplace', label: 'Marketplace', icon: '🏪' },
  ]

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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="text-slate-400 hover:text-white transition-colors">← Back to Admin</Link>
              <div className="px-4 py-1 bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/50 rounded-full">
                <span className="text-red-400 font-bold text-sm">⚡ DIRECT POST MANAGEMENT</span>
              </div>
            </div>
            <button onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-green-500 text-white rounded-xl font-bold text-sm hover:bg-green-600 transition-all">
              + Create Post (No Escrow)
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-4xl font-black text-white mb-2">Direct Post Management</h2>
        <p className="text-slate-400 mb-2">Add or delete posts directly without escrow or payment processing</p>
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl mb-8">
          <p className="text-red-400 text-sm font-semibold">⚠️ Warning: Actions here bypass escrow, payment verification, and standard workflows. Use with caution.</p>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto">
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                activeTab === tab.key ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        <div className="mb-6">
          <input type="text" placeholder="Search posts..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500" />
        </div>

        <div className="space-y-3">
          {filteredPosts.length === 0 ? (
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center text-slate-500">
              No {activeTab}s found
            </div>
          ) : (
            filteredPosts.map(post => (
              <div key={post.id} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="text-white font-semibold text-sm truncate">{post.title || 'Untitled'}</div>
                  <div className="text-slate-500 text-xs mt-1">
                    ID: {post.id?.slice(0, 8)}... •
                    Status: <span className={post.status === 'active' ? 'text-green-400' : post.status === 'pending' ? 'text-orange-400' : 'text-red-400'}>{post.status}</span> •
                    Created: {new Date(post.created_at).toLocaleDateString()}
                  </div>
                  {post.description && (
                    <div className="text-slate-500 text-xs mt-1 truncate">{post.description}</div>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {post.status !== 'active' && (
                    <button onClick={() => forceUpdateStatus(post.id, 'active')} disabled={actionLoading === post.id}
                      className="px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg text-xs font-bold hover:bg-green-500/30">
                      Force Active
                    </button>
                  )}
                  {post.status === 'active' && (
                    <button onClick={() => forceUpdateStatus(post.id, 'suspended')} disabled={actionLoading === post.id}
                      className="px-3 py-1.5 bg-orange-500/20 text-orange-400 rounded-lg text-xs font-bold hover:bg-orange-500/30">
                      Suspend
                    </button>
                  )}
                  <button onClick={() => deletePost(post.id)} disabled={actionLoading === post.id}
                    className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-xs font-bold hover:bg-red-500/30">
                    🗑 Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowCreateModal(false)}>
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-8 max-w-lg w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Create {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} (No Escrow)</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white text-2xl">✕</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Title *</label>
                <input type="text" value={newPost.title} onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500" />
              </div>

              <div>
                <label className="text-sm text-slate-400 mb-1 block">Description</label>
                <textarea value={newPost.description} onChange={(e) => setNewPost({ ...newPost, description: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500 h-24 resize-none" />
              </div>

              <div>
                <label className="text-sm text-slate-400 mb-1 block">Category</label>
                <input type="text" value={newPost.category} onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500" />
              </div>

              {(activeTab === 'marketplace' || activeTab === 'giveaway') && (
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">{activeTab === 'marketplace' ? 'Price' : 'Entry Price'}</label>
                  <input type="number" value={newPost.price} onChange={(e) => setNewPost({ ...newPost, price: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500" />
                </div>
              )}

              {activeTab === 'raffle' && (
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Ticket Price</label>
                  <input type="number" value={newPost.ticket_price} onChange={(e) => setNewPost({ ...newPost, ticket_price: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500" />
                </div>
              )}

              {activeTab === 'fundraiser' && (
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Goal Amount</label>
                  <input type="number" value={newPost.goal_amount} onChange={(e) => setNewPost({ ...newPost, goal_amount: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500" />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Currency</label>
                  <select value={newPost.currency} onChange={(e) => setNewPost({ ...newPost, currency: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500">
                    <option value="USDC">USDC</option>
                    <option value="SOL">SOL</option>
                    <option value="ETH">ETH</option>
                    <option value="FREE">FREE</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Status</label>
                  <select value={newPost.status} onChange={(e) => setNewPost({ ...newPost, status: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500">
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm text-slate-400 mb-1 block">End Date</label>
                <input type="datetime-local" value={newPost.end_date} onChange={(e) => setNewPost({ ...newPost, end_date: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500" />
              </div>

              <button onClick={createPost} disabled={!newPost.title || actionLoading === 'create'}
                className="w-full py-3 bg-green-500 text-white rounded-xl font-bold text-sm hover:bg-green-600 transition-all disabled:opacity-50">
                {actionLoading === 'create' ? 'Creating...' : `Create ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} (No Escrow)`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
