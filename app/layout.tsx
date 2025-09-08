import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "./components/Navigation";
import { AuthProvider } from "./context/AuthContext";
import UserProfile from "./components/UserProfile";
import PageTitle from "./components/PageTitle";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "NJCHODAE Library",
  description: "NJCHODAE Library System - 뉴저지초대교회 도서관",
  keywords: ["NJCHODAE", "도서관", "Library", "뉴저지초대교회", "교회", "도서"],
  authors: [{ name: "NJCHODAE" }],
  manifest: '/site.webmanifest',
  metadataBase: new URL('https://library.njchodae.org'),
  icons: {
    icon: [
      { url: '/favicon.ico?v=2', sizes: 'any' },
      { url: '/njchodae-icon.png', type: 'image/png', sizes: '32x32' }
    ],
    shortcut: '/njchodae-icon.png',
    apple: [
      { url: '/njchodae-icon.png', sizes: '180x180', type: 'image/png' }
    ],
    other: [
      { rel: 'apple-touch-icon', url: '/njchodae-icon.png' },
      { rel: 'mask-icon', url: '/njchodae-icon.png', color: '#000000' }
    ]
  },
  openGraph: {
    title: 'NJCHODAE Library',
    description: 'NJCHODAE Library - 뉴저지초대교회 도서관',
    url: 'https://library.njchodae.org',
    siteName: 'NJCHODAE Library',
    locale: 'ko_KR',
    type: 'website',
    images: [
      {
        url: '/njchodae-logo.png',
        width: 800,
        height: 600,
        alt: 'NJCHODAE Library Logo'
      }
    ]
  },
};

/**
 * Root Layout Component
 * 
 * This is the main layout component that wraps all pages.
 * It includes:
 * - Font configuration (Inter)
 * - Basic page structure (header and main content)
 * - NJCHODAE branding in the header
 * 
 * @component
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <div className="flex min-h-screen bg-gray-50">
            <Navigation />
            <div className="flex-1 md:ml-64 relative transition-all duration-300">
              {/* Top Navigation Bar - Fixed */}
              <header className="fixed top-0 right-0 left-0 md:left-64 bg-white shadow-sm border-b border-gray-200 px-6 py-4 z-40">
                <div className="flex items-center justify-between">
                  {/* Left side - Hamburger menu for mobile */}
                  <div className="flex items-center space-x-4">
                    <button className="md:hidden p-2 rounded-lg hover:bg-gray-100">
                      <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    </button>
                    <PageTitle />
                  </div>

                  {/* Right side - User actions */}
                  <div className="flex items-center space-x-4">
                    {/* User Profile */}
                    <UserProfile />
                  </div>
                </div>
              </header>

              {/* Main Content - with top padding to account for fixed header */}
              <main className="px-6 py-8 pt-20">
                {children}
              </main>
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
