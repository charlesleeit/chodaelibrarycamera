import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "./components/Navigation";
import { AuthProvider } from "./context/AuthContext";
import UserProfile from "./components/UserProfile";

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
          <div className="flex min-h-screen">
            <Navigation />
            <div className="flex-1 md:ml-64 relative">
              <UserProfile />
              <main className="px-4 sm:px-6 lg:px-8 py-8 mt-16 md:mt-0">
                {children}
              </main>
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
