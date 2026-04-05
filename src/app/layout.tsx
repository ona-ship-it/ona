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
import { ErrorBoundary } from '@/components/ErrorBoundary'
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Onagui - Social Fintech Platform',
  description: 'The social fintech platform where you can win, fundraise, and grow together. Giveaways, raffles, crowdfunding, and community — all in one place.',
  openGraph: {
    title: 'Onagui - Social Fintech Platform',
    description: 'The social fintech platform where you can win, fundraise, and grow together. Giveaways, raffles, crowdfunding, and community — all in one place.',
    images: [
      {
        url: 'https://www.onagui.com/og-default.png',
        width: 1200,
        height: 630,
        alt: 'Onagui - Social Fintech Platform',
      },
    ],
    type: 'website',
    siteName: 'Onagui',
    url: 'https://www.onagui.com',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Onagui - Social Fintech Platform',
    description: 'The social fintech platform where you can win, fundraise, and grow together.',
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
        <link rel="icon" type="image/png" href="/my-favicon/favicon-96x96.png?v=20260405" sizes="96x96" />
        <link rel="icon" type="image/svg+xml" href="/my-favicon/favicon.svg?v=20260405" />
        <link rel="shortcut icon" href="/my-favicon/favicon.ico?v=20260405" />
        <link rel="apple-touch-icon" sizes="180x180" href="/my-favicon/apple-touch-icon.png?v=20260405" />
        <link rel="manifest" href="/my-favicon/site.webmanifest?v=20260405" />
      </head>
      <body className={inter.className}>
        <ErrorBoundary>
          <ThemeProvider>
            <WalletProvider>
              <Header />
              <div className="page-body">
                {children}
              </div>
            </WalletProvider>
          </ThemeProvider>
          <BottomNav />
        </ErrorBoundary>
      </body>
    </html>
  )
}
