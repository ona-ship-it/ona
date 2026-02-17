
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@/styles/theme.css'
import '@/styles/components.css'
import '@/styles/animations.css'
import '@/styles/overrides.css'
import './globals.css'
import { WalletProvider } from '@/hooks/useWallet'
import { ThemeProvider } from '@/components/ThemeContext'
import BottomNav from '@/components/BottomNav';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Onagui - Web3 Giveaway Platform',
  description: 'Create and participate in crypto-powered giveaways and raffles',
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
