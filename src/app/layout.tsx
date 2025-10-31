import './globals.css';
import { ThemeProvider } from '@/components/ThemeContext';
import Sidebar from '@/components/Sidebar';
import ClientWrapper from './ClientWrapper';
import { WalletServicesProvider } from '@/components/WalletServicesProvider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <WalletServicesProvider>
            <Sidebar />
            <ClientWrapper>{children}</ClientWrapper>
          </WalletServicesProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}