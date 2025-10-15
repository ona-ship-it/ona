import './globals.css';
import { ThemeProvider } from '@/components/ThemeContext';
import Sidebar from '@/components/Sidebar';
import ClientWrapper from './ClientWrapper';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <Sidebar />
          <ClientWrapper>{children}</ClientWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
