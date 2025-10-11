'use client'; 
 
import { useEffect, useState } from 'react'; 
import { ThemeProvider } from '@/components/ThemeContext';
import Sidebar from '@/components/Sidebar';
import './globals.css'; 
 
export default function RootLayout({ children }: { children: React.ReactNode }) { 
  const [mounted, setMounted] = useState(false); 
 
  useEffect(() => { 
    // mark client mount so DOM operations are safe 
    setMounted(true); 
  }, []); 
 
  const toggleSidebar = () => { 
    if (!mounted) return; 
    document.documentElement.classList.toggle('sidebar-open'); 
  }; 
 
  return ( 
    <html lang="en" suppressHydrationWarning> 
      <body className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"> 
        <ThemeProvider>
          {/* Desktop sidebar */}
          <Sidebar />
          {/* Mobile top bar (only visible on small screens) */} 
          <header className="sm:hidden fixed top-0 left-0 w-full z-40 flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900 border-b dark:border-gray-700"> 
            <button 
              onClick={toggleSidebar} 
              aria-label="Open menu" 
              className="p-2 rounded-md focus:outline-none" 
            > 
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"> 
                <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /> 
              </svg> 
            </button> 
  
            <div className="flex items-center gap-3"> 
              {/* Theme toggle button using next-themes */}
              <button 
                onClick={() => {
                  const html = document.documentElement;
                  const isDark = html.classList.contains('dark');
                  if (isDark) {
                    html.classList.remove('dark');
                  } else {
                    html.classList.add('dark');
                  }
                  console.log('Toggled theme:', isDark ? 'light' : 'dark');
                }}
                className="p-2 rounded-md bg-gray-200 dark:bg-gray-700"
              >
                Toggle Theme
              </button>
            </div>
          </header>

          <main className="pt-16 sm:pt-0 min-h-screen transition-all duration-300" style={{ marginLeft: 'var(--sidebar-width, 0px)' }}>
            {children}
          </main>
        </ThemeProvider>
      </body> 
    </html> 
  ); 
}
