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
    <html lang="en" suppressHydrationWarning>
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
        
        {/* Onagui Brand Favicon - Added Here */}
        <link rel="icon" type="image/png" href="/my-favicon/favicon-96x96.png" sizes="96x96" />
        <link rel="icon" type="image/svg+xml" href="/my-favicon/favicon.svg" />
        <link rel="shortcut icon" href="/my-favicon/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/my-favicon/apple-touch-icon.png" />
        <link rel="manifest" href="/my-favicon/site.webmanifest" />
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
