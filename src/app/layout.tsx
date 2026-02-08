import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { WalletProvider } from '@/hooks/useWallet'
import { ThemeProvider } from '@/components/ThemeContext'
import { Layout } from '@/components/ui/Layout'

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
      <body className={inter.className}>
        <ThemeProvider>
          <WalletProvider>
            <Layout>
              {children}
            </Layout>
          </WalletProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}