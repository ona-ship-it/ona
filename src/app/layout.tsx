import './globals.css';
import { ThemeProvider } from '@/components/ThemeContext';
import Sidebar from '@/components/Sidebar';
import ClientWrapper from './ClientWrapper';
import { WalletServicesProvider } from '@/components/WalletServicesProvider';
import { Toaster } from 'sonner';
import { AdminProvider } from '@/context/AdminContext';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <AdminProvider>
            <WalletServicesProvider>
              <Sidebar />
              <ClientWrapper>{children}</ClientWrapper>
              <Toaster richColors position="top-right" />
            </WalletServicesProvider>
          </AdminProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}