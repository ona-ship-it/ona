'use client'

import { useState } from 'react'

export default function Marketplace() {
  const [category, setCategory] = useState('all')
  const [sortBy, setSortBy] = useState('popular')

  const products = [
    { id: 1, name: 'Limited Edition NFT', price: 0.5, currency: 'ETH', seller: 'CryptoArt', rating: 4.8, sales: 45, image: '🎨', category: 'digital' },
    { id: 2, name: 'Gaming Headset Pro', price: 149.99, currency: 'USD', seller: 'TechStore', rating: 4.9, sales: 234, image: '🎧', category: 'gaming' },
    { id: 3, name: 'Rare Collectible Card', price: 299.99, currency: 'USD', seller: 'CardMaster', rating: 5.0, sales: 12, image: '🃏', category: 'collectibles' },
    { id: 4, name: 'Premium Merch Bundle', price: 79.99, currency: 'USD', seller: 'BrandStore', rating: 4.7, sales: 156, image: '👕', category: 'merch' },
    { id: 5, name: 'Digital Art Pack', price: 0.25, currency: 'ETH', seller: 'PixelPro', rating: 4.6, sales: 89, image: '🖼️', category: 'digital' },
    { id: 6, name: 'Mechanical Keyboard', price: 199.99, currency: 'USD', seller: 'KeyboardKing', rating: 4.9, sales: 167, image: '⌨️', category: 'gaming' },
  ]

  const categories = [
    { id: 'all', name: 'All Items', icon: '🏪' },
    { id: 'digital', name: 'Digital', icon: '💎' },
    { id: 'gaming', name: 'Gaming', icon: '🎮' },
    { id: 'collectibles', name: 'Collectibles', icon: '🏆' },
    { id: 'merch', name: 'Merch', icon: '👕' },
  ]

  return (
    <div className="min-h-screen bg-[#0f0f23] text-white">
      {/* Header */}
      <header className="bg-[#0f0f23]/95 backdrop-blur-xl border-b border-white/5 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                ONAGUI MARKETPLACE
              </h1>
              <p className="text-gray-400 text-sm mt-1">Buy and sell exclusive items</p>
            </div>
            <button className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 rounded-lg px-6 py-2.5 font-semibold transition-all">
              Sell Item
            </button>
          </div>
        </div>
      </header>

      {/* Stats Banner */}
      <div className="bg-gradient-to-r from-blue-950/40 via-blue-900/40 to-blue-950/40 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">2,547</div>
              <div className="text-sm text-gray-400">Active Listings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">$125K</div>
              <div className="text-sm text-gray-400">Volume (24h)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">1,234</div>
              <div className="text-sm text-gray-400">Sellers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">8,456</div>
              <div className="text-sm text-gray-400">Items Sold</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <aside className="w-64 flex-shrink-0 space-y-6">
            {/* Categories */}
            <div className="bg-[#1a1a2e] rounded-2xl p-6 border border-white/10">
              <h3 className="font-bold mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                      category === cat.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-white/5 hover:bg-white/10 text-gray-300'
                    }`}
                  >
                    <span className="text-xl">{cat.icon}</span>
                    <span className="font-medium">{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="bg-[#1a1a2e] rounded-2xl p-6 border border-white/10">
              <h3 className="font-bold mb-4">Price Range</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Min Price</label>
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500/50"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Max Price</label>
                  <input
                    type="number"
                    placeholder="Any"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500/50"
                  />
                </div>
                <button className="w-full bg-blue-600 hover:bg-blue-700 rounded-lg py-2 text-sm font-medium transition-all">
                  Apply Filter
                </button>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-[#1a1a2e] rounded-2xl p-6 border border-white/10">
              <h3 className="font-bold mb-4">Payment Methods</h3>
              <div className="space-y-2">
                {['USD', 'ETH', 'USDC', 'MATIC'].map((method) => (
                  <label key={method} className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-600 text-blue-600 focus:ring-blue-500" />
                    <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{method}</span>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Controls */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="text-gray-400">Showing {products.length} items</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-400">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500/50"
                >
                  <option value="popular">Most Popular</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="newest">Newest First</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-[#1a1a2e] rounded-2xl overflow-hidden border border-white/10 hover:border-blue-500/50 transition-all group"
                >
                  {/* Image */}
                  <div className="relative aspect-square bg-gradient-to-br from-blue-950/60 to-blue-900/60 flex items-center justify-center overflow-hidden">
                    <div className="text-8xl group-hover:scale-110 transition-transform duration-300">{product.image}</div>
                    
                    {/* Quick Actions */}
                    <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="w-10 h-10 bg-black/60 backdrop-blur-sm hover:bg-black/80 rounded-lg flex items-center justify-center transition-all">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </button>
                      <button className="w-10 h-10 bg-black/60 backdrop-blur-sm hover:bg-black/80 rounded-lg flex items-center justify-center transition-all">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                      </button>
                    </div>

                    {/* Badge */}
                    {product.rating >= 4.8 && (
                      <div className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                        🔥 Hot
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="mb-3">
                      <h3 className="font-bold text-lg mb-1 group-hover:text-blue-400 transition-colors">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span>by {product.seller}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span>{product.rating}</span>
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-3 mb-4 text-sm text-gray-400">
                      <span>{product.sales} sold</span>
                    </div>

                    {/* Price & Action */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-gray-400 mb-1">Price</div>
                        <div className="text-xl font-bold text-blue-400">
                          {product.currency === 'ETH' ? `${product.price} ETH` : `$${product.price}`}
                        </div>
                      </div>
                      <button className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 rounded-lg px-6 py-2.5 font-semibold transition-all shadow-lg shadow-blue-500/25">
                        Buy Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More */}
            <div className="text-center mt-12">
              <button className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-8 py-3 font-medium transition-all">
                Load More Items
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}