'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { ChevronRight, Zap, Users, Trophy, TrendingUp, Shield, Rocket } from 'lucide-react'

export default function Home() {
  const { user, loading } = useAuth()

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-lg border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold">
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              ONAGUI
            </span>
          </Link>
          
          <div className="hidden lg:flex gap-8">
            <Link href="/giveaways" className="text-gray-400 hover:text-white transition">Giveaways</Link>
            <Link href="/raffles" className="text-gray-400 hover:text-white transition">Raffles</Link>
            <Link href="/marketplace" className="text-gray-400 hover:text-white transition">Marketplace</Link>
            <Link href="/fundraise" className="text-gray-400 hover:text-white transition">Fundraise</Link>
          </div>

          <div className="flex gap-3">
            {!loading && (
              <>
                {user ? (
                  <div className="flex gap-3">
                    <Link href="/wallet" className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg font-medium hover:opacity-90 transition">
                      Wallet
                    </Link>
                    <Link href="/profile" className="px-4 py-2 border border-gray-700 rounded-lg hover:border-gray-500 transition">
                      Profile
                    </Link>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <Link href="/login" className="px-4 py-2 text-gray-300 hover:text-white transition">
                      Sign In
                    </Link>
                    <Link href="/signup" className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg font-medium hover:opacity-90 transition">
                      Get Started
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-1/4 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <span className="inline-block px-3 py-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-full text-sm text-blue-300">
              ✨ The Future of Gaming & Rewards
            </span>
          </div>

          <h1 className="text-7xl lg:text-8xl font-bold mb-6 leading-tight">
            Play, Win,
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Earn
            </span>
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mb-8 leading-relaxed">
            Experience the next generation of gaming platform where giveaways, raffles, and community rewards come together. Join thousands of players winning every day.
          </p>

          <div className="flex gap-4 mb-16">
            {user ? (
              <>
                <Link href="/giveaways" className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg font-semibold hover:opacity-90 transition flex items-center gap-2">
                  Explore Giveaways <ChevronRight className="w-4 h-4" />
                </Link>
                <Link href="/wallet" className="px-8 py-3 border border-gray-700 rounded-lg font-semibold hover:border-gray-500 transition">
                  My Wallet
                </Link>
              </>
            ) : (
              <>
                <Link href="/signup" className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg font-semibold hover:opacity-90 transition flex items-center gap-2">
                  Start Playing <ChevronRight className="w-4 h-4" />
                </Link>
                <Link href="/login" className="px-8 py-3 border border-gray-700 rounded-lg font-semibold hover:border-gray-500 transition">
                  Sign In
                </Link>
              </>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 pt-8 border-t border-gray-800">
            <div>
              <div className="text-3xl font-bold text-blue-400 mb-1">10K+</div>
              <div className="text-gray-500 text-sm">Active Players</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-400 mb-1">$5M+</div>
              <div className="text-gray-500 text-sm">Prizes Awarded</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-pink-400 mb-1">24/7</div>
              <div className="text-gray-500 text-sm">Live Events</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 border-t border-gray-800/50">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <h2 className="text-4xl font-bold mb-4">Everything You Need to Win</h2>
            <p className="text-gray-400 text-lg">Powerful features designed for every type of player</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="group p-8 rounded-xl bg-gradient-to-br from-gray-900 to-black border border-gray-800 hover:border-blue-500/50 transition">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-6">
                <Trophy className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Giveaways</h3>
              <p className="text-gray-400">Create and participate in giveaways with real prizes. Full control over entry methods and rewards.</p>
            </div>

            {/* Feature 2 */}
            <div className="group p-8 rounded-xl bg-gradient-to-br from-gray-900 to-black border border-gray-800 hover:border-purple-500/50 transition">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mb-6">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Raffles</h3>
              <p className="text-gray-400">Daily raffles with instant results. Buy tickets with tokens or use free daily entries.</p>
            </div>

            {/* Feature 3 */}
            <div className="group p-8 rounded-xl bg-gradient-to-br from-gray-900 to-black border border-gray-800 hover:border-pink-500/50 transition">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center mb-6">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Marketplace</h3>
              <p className="text-gray-400">Buy and sell items with the community. Secure transactions with instant settlement.</p>
            </div>

            {/* Feature 4 */}
            <div className="group p-8 rounded-xl bg-gradient-to-br from-gray-900 to-black border border-gray-800 hover:border-green-500/50 transition">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mb-6">
                <Rocket className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Fundraise</h3>
              <p className="text-gray-400">Support projects and campaigns. Contribute to community initiatives and earn rewards.</p>
            </div>

            {/* Feature 5 */}
            <div className="group p-8 rounded-xl bg-gradient-to-br from-gray-900 to-black border border-gray-800 hover:border-yellow-500/50 transition">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center mb-6">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Community</h3>
              <p className="text-gray-400">Connect with other players. View profiles, track achievements, and build your reputation.</p>
            </div>

            {/* Feature 6 */}
            <div className="group p-8 rounded-xl bg-gradient-to-br from-gray-900 to-black border border-gray-800 hover:border-cyan-500/50 transition">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center mb-6">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Secure Wallet</h3>
              <p className="text-gray-400">Multi-chain crypto support. Secure transactions with instant deposits and withdrawals.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6 border-t border-gray-800/50 bg-gradient-to-b from-black to-gray-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-gray-400 text-lg">Get started in three simple steps</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-6 text-2xl font-bold">1</div>
              <h3 className="text-xl font-semibold mb-3">Create Account</h3>
              <p className="text-gray-400">Sign up in seconds with your email or wallet. Verify and you're ready to play.</p>
            </div>

            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mb-6 text-2xl font-bold">2</div>
              <h3 className="text-xl font-semibold mb-3">Fund Wallet</h3>
              <p className="text-gray-400">Deposit crypto instantly. Supports multiple chains and tokens for maximum flexibility.</p>
            </div>

            <div>
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-full flex items-center justify-center mb-6 text-2xl font-bold">3</div>
              <h3 className="text-xl font-semibold mb-3">Start Winning</h3>
              <p className="text-gray-400">Play giveaways, raffles, and more. Withdraw winnings anytime to your wallet.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 border-t border-gray-800/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-gray-400 mb-8">Join thousands of players and start winning today</p>
          
          <div className="flex gap-4 justify-center">
            {user ? (
              <>
                <Link href="/giveaways" className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg font-semibold hover:opacity-90 transition">
                  Browse Giveaways
                </Link>
                <Link href="/wallet" className="px-8 py-4 border border-gray-700 rounded-lg font-semibold hover:border-gray-500 transition">
                  Check Wallet
                </Link>
              </>
            ) : (
              <>
                <Link href="/signup" className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg font-semibold hover:opacity-90 transition">
                  Create Free Account
                </Link>
                <Link href="/login" className="px-8 py-4 border border-gray-700 rounded-lg font-semibold hover:border-gray-500 transition">
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800/50 py-16 px-6 bg-gradient-to-t from-gray-900/50 to-transparent">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-5 gap-12 mb-12">
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/giveaways" className="hover:text-white transition">Giveaways</Link></li>
                <li><Link href="/raffles" className="hover:text-white transition">Raffles</Link></li>
                <li><Link href="/marketplace" className="hover:text-white transition">Marketplace</Link></li>
                <li><Link href="/fundraise" className="hover:text-white transition">Fundraise</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Community</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/profile" className="hover:text-white transition">Players</Link></li>
                <li><Link href="/contact" className="hover:text-white transition">Contact</Link></li>
                <li><a href="#" className="hover:text-white transition">Discord</a></li>
                <li><a href="#" className="hover:text-white transition">Twitter</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Account</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/wallet" className="hover:text-white transition">Wallet</Link></li>
                <li><Link href="/account" className="hover:text-white transition">Settings</Link></li>
                <li><Link href="/settings" className="hover:text-white transition">Preferences</Link></li>
                <li><a href="#" className="hover:text-white transition">Referral</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition">Terms</a></li>
                <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition">Cookies</a></li>
                <li><a href="#" className="hover:text-white transition">Status</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">ONAGUI</h4>
              <p className="text-gray-400 text-sm">The next generation gaming and rewards platform.</p>
            </div>
          </div>

          <div className="border-t border-gray-800/50 pt-8 flex justify-between items-center text-gray-400 text-sm">
            <p>© 2026 ONAGUI. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition">Twitter</a>
              <a href="#" className="hover:text-white transition">Discord</a>
              <a href="#" className="hover:text-white transition">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
