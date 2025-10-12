import './globals.css';
import Providers from './providers';
import Sidebar from '@/components/Sidebar';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <Providers>
          <Sidebar />
          <main className="pt-16 sm:pt-0 min-h-screen transition-all duration-300" style={{ marginLeft: 'var(--sidebar-width, 0px)' }}>
            {children}
          </main>
          <Analytics />
          <SpeedInsights />
        </Providers>
      </body>
    </html>
  );
}