import './globals.css';
import { ThemeProvider } from '@/components/ThemeContext';
import Sidebar from '@/components/Sidebar';
import ClientWrapper from './ClientWrapper';
import { WalletServicesProvider } from '@/components/WalletServicesProvider';
import { Toaster } from 'sonner';
import { AdminProvider } from '@/context/AdminContext';
import { createServerClient } from '@supabase/ssr';
import type { Database } from '@/types/supabase';
import { cookies } from 'next/headers';
import type { User } from '@supabase/supabase-js';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Read session on the server to provide initial user to client UI
  const cookieStore = cookies();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        // The following set/remove are no-ops for server component initial read,
        // but included to satisfy the auth helpers interface.
        set(name: string, value: string, options: any) {
          (cookieStore as any).set?.(name, value, options);
        },
        remove(name: string, options: any) {
          (cookieStore as any).delete?.(name, options);
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();
  const initialUser: User | null = session?.user ?? null;

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
