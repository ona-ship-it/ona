import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "../components/ThemeContext";
import ThemeToggle from "../components/ThemeToggle";
import { AuthProvider } from "../components/AuthContext";
import SignInPopupWrapper from "../components/SignInPopupWrapper";
import SideNavbar from "../components/SideNavbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ONAGUI",
  description: "ONAGUI - The Future of Fundraising",
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
        <AuthProvider>
          <ThemeProvider>
            <div className="flex min-h-screen">
              <SideNavbar />
              <div className="flex-1 ml-16 w-full">
                {children}
              </div>
            </div>
            <SignInPopupWrapper />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
