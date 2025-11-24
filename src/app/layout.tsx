import './globals.css';
import { ThemeProvider } from '@/components/ThemeContext';
import Sidebar from '@/components/Sidebar';
import ClientWrapper from './ClientWrapper';
import { WalletServicesProvider } from '@/components/WalletServicesProvider';
import { Toaster } from 'sonner';
import { AdminProvider } from '@/context/AdminContext';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import type { User } from '@supabase/supabase-js';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Read session on the server to provide initial user to client UI
  const supabase = createServerComponentClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  const initialUser: User | null = user ?? null;

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <AdminProvider>
            <WalletServicesProvider>
              <Sidebar />
              <ClientWrapper initialUser={initialUser}>{children}</ClientWrapper>
              <Toaster richColors position="top-right" />
            </WalletServicesProvider>
          </AdminProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
