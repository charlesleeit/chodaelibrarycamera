'use client';

import { usePathname } from 'next/navigation';
import Navigation from './Navigation';
import UserProfile from './UserProfile';
import PageTitle from './PageTitle';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';
  const isTakeoutPage = pathname === '/takeout';
  const isReturnPage = pathname === '/return';
  const isCenteredPage = isLoginPage || isTakeoutPage || isReturnPage;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Navigation />
      <div className="flex-1 md:ml-72 relative transition-all duration-300">
        {/* Top Navigation Bar - Fixed */}
        <header className="fixed top-0 right-0 left-0 md:left-72 bg-white shadow-sm border-b border-gray-200 px-6 py-4 z-40">
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
        <main className={`px-6 py-8 pt-20 ${isCenteredPage ? 'flex items-center justify-center min-h-screen' : ''}`}>
          {children}
        </main>
      </div>
    </div>
  );
}
