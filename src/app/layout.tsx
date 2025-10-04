import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import SideNavbar from "@/components/SideNavbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Onagui",
  description: "Onagui platform for raffles, giveaways, and more",
  icons: [
    { rel: 'icon', url: '/favicon.ico' },
    { rel: 'apple-touch-icon', url: '/onagui_icon_clean_180x180.png' },
    { rel: 'icon', url: '/onagui_icon_clean_32x32.png', sizes: '32x32', type: 'image/png' },
    { rel: 'icon', url: '/onagui_icon_clean_16x16.png', sizes: '16x16', type: 'image/png' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <div className="flex min-h-screen">
            <SideNavbar />
            <main className="flex-1 pl-16">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
