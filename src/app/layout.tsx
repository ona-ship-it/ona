import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@/styles/theme.css'
import '@/styles/components.css'
import '@/styles/animations.css'
import '@/styles/overrides.css'
import '@/styles/raffle-cards.css'
import './globals.css'
import { WalletProvider } from '@/hooks/useWallet'
import { ThemeProvider } from '@/components/ThemeContext'
import BottomNav from '@/components/BottomNav';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Onagui - Web3 Giveaway & Raffle Platform',
  description: 'Create and participate in provably fair giveaways and raffles. Win real prizes with transparent, blockchain-verified draws.',
  openGraph: {
    title: 'Onagui - Web3 Giveaway & Raffle Platform',
    description: 'Create and participate in provably fair giveaways and raffles. Win real prizes with transparent, blockchain-verified draws.',
    images: [
      {
        url: 'https://www.onagui.com/og-default.png',
        width: 1200,
        height: 630,
        alt: 'Onagui - Web3 Giveaway Platform',
      },
    ],
    type: 'website',
    siteName: 'Onagui',
    url: 'https://www.onagui.com',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Onagui - Web3 Giveaway & Raffle Platform',
    description: 'Create and participate in provably fair giveaways and raffles. Win real prizes.',
    images: ['https://www.onagui.com/og-default.png'],
    site: '@onaborado',
  },
  metadataBase: new URL('https://www.onagui.com'),
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Anti-flash script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem('onagui-theme') || 
                  (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                document.documentElement.setAttribute('data-theme', theme);
              })();
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <WalletProvider>
            {children}
          </WalletProvider>
        </ThemeProvider>
        <BottomNav />
      </body>
    </html>
  )
}
