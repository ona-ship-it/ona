#!/bin/bash

echo "🔧 Restoring homepage and layout..."
echo ""

# Create a clean, simple homepage
echo "📝 Creating new homepage..."
cat > src/app/page.tsx << 'EOF'
'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'

export default function Home() {
  const { user, loading } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
      {/* Navigation */}
      <nav className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-white">
              ONAGUI
            </Link>
            
            <div className="flex items-center gap-6">
              {!loading && (
                <>
                  {user ? (
                    <>
                      <Link href="/profile" className="text-white hover:text-purple-300 transition-colors">
                        Profile
                      </Link>
                      <Link href="/giveaways" className="text-white hover:text-purple-300 transition-colors">
                        Giveaways
                      </Link>
                    </>
                  ) : (
                    <Link 
                      href="/login"
                      className="bg-white text-purple-900 px-6 py-2 rounded-lg font-medium hover:bg-purple-50 transition-colors"
                    >
                      Sign Up
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-white mb-6">
            ONAGUI
          </h1>
          <p className="text-2xl text-purple-200 mb-4">
            Statistically Your Best Chance To Win
          </p>
          <p className="text-xl text-purple-300 mb-12">
            Create giveaways, enter contests, win amazing prizes with crypto
          </p>
          
          <div className="flex justify-center gap-4">
            {!user ? (
              <>
                <Link
                  href="/login"
                  className="bg-white text-purple-900 px-8 py-4 rounded-lg text-lg font-bold hover:bg-purple-50 transition-colors"
                >
                  Get Started
                </Link>
                <Link
                  href="/giveaways"
                  className="bg-purple-600 text-white px-8 py-4 rounded-lg text-lg font-bold hover:bg-purple-700 transition-colors"
                >
                  Browse Giveaways
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/giveaways/create"
                  className="bg-white text-purple-900 px-8 py-4 rounded-lg text-lg font-bold hover:bg-purple-50 transition-colors"
                >
                  Create Giveaway
                </Link>
                <Link
                  href="/giveaways"
                  className="bg-purple-600 text-white px-8 py-4 rounded-lg text-lg font-bold hover:bg-purple-700 transition-colors"
                >
                  Browse Giveaways
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
            <div className="text-4xl mb-4">🎁</div>
            <h3 className="text-2xl font-bold text-white mb-3">Create Giveaways</h3>
            <p className="text-purple-200">
              Launch your own giveaways with custom entry methods and prizes
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
            <div className="text-4xl mb-4">🎟️</div>
            <h3 className="text-2xl font-bold text-white mb-3">Enter to Win</h3>
            <p className="text-purple-200">
              Use free tickets or buy entries with crypto for a chance to win
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-2xl font-bold text-white mb-3">Crypto Powered</h3>
            <p className="text-purple-200">
              Pay with USDC, ETH, MATIC on multiple blockchains
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mt-20 text-center">
          <div>
            <div className="text-4xl font-bold text-white mb-2">10K+</div>
            <div className="text-purple-300">Active Users</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-white mb-2">500+</div>
            <div className="text-purple-300">Giveaways Created</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-white mb-2">$2M+</div>
            <div className="text-purple-300">In Prizes</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-white mb-2">95%</div>
            <div className="text-purple-300">Success Rate</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black/20 backdrop-blur-sm border-t border-white/10 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-purple-300">
            <p>© 2026 Onagui. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
EOF
echo "✅ Homepage created"

# Ensure layout.tsx exists
echo "📝 Checking layout..."
if [ ! -f "src/app/layout.tsx" ]; then
    echo "Creating layout.tsx..."
    cat > src/app/layout.tsx << 'EOF'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Onagui - Web3 Giveaway Platform',
  description: 'Create and enter crypto-powered giveaways',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
EOF
    echo "✅ Layout created"
else
    echo "✅ Layout exists"
fi

echo ""
echo "🎉 Homepage and layout restored!"
echo ""
echo "📋 Next: Commit and push"
echo "   git add ."
echo "   git commit -m 'Restore homepage and layout'"
echo "   git push origin main"
echo ""
