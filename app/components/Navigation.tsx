'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '../context/AuthContext';
import { FaHome, FaBook, FaExchangeAlt, FaUsers, FaBookDead, FaFileAlt, FaChevronDown } from 'react-icons/fa';
import { useState } from 'react';

const Navigation = () => {
  const pathname = usePathname();
  const { isLoggedIn } = useAuth();
  const [reportOpen, setReportOpen] = useState(false);

  const handleMenuClick = (path: string, _e: React.MouseEvent) => {
    // Allow access to home page, takeout page, return page and book list without login
    if (path === '/' || path === '/takeout' || path === '/return' || path === '/books') return;
    
    // Redirect to login if not logged in
    if (!isLoggedIn) {
      // e.preventDefault();
      // router.push('/login');
    }
  };

  const menuItems = [
    { name: 'Home', path: '/', icon: FaHome },
    { name: 'Book List', path: '/books', icon: FaBook },
    { name: 'Take out', path: '/takeout', icon: FaBookDead },
    { name: 'Return', path: '/return', icon: FaExchangeAlt },
    {
      name: 'Report',
      path: '/reports',
      icon: FaFileAlt,
      children: [
        { name: '대출 현황', path: '/loanstatus' },
        { name: '반납 현황', path: '/reports/return' },
      ],
      requiresAuth: true, // 로그인 필요 표시
    },
    { name: 'Users', path: '/users', icon: FaUsers, requiresAuth: true }, // Users도 로그인 필요
  ];

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-white to-gray-50 border-r border-gray-200 text-gray-800 shadow-lg">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-8">
          <Image
            src="/njchodae-logo.png"
            alt="NJCHODAE"
            width={24}
            height={24}
            priority
            className="h-8 w-auto"
            unoptimized
          />
        </div>
        <nav>
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              
              // 로그인이 필요한 메뉴이고 로그인되지 않은 경우 건너뛰기
              if (item.requiresAuth && !isLoggedIn) {
                return null;
              }
              
              if (item.children) {
                return (
                  <li key={item.path}>
                    <button
                      type="button"
                      onClick={() => setReportOpen((open) => !open)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg w-full transition-all duration-200 font-medium ${
                        pathname.startsWith(item.path)
                          ? 'bg-blue-50 text-blue-700 shadow-sm'
                          : 'hover:bg-gray-50 hover:text-blue-600'
                      }`}
                    >
                      <Icon className={`text-lg ${pathname.startsWith(item.path) ? 'text-blue-600' : 'text-gray-500'}`} />
                      <span>{item.name}</span>
                      <FaChevronDown className={`ml-auto transition-transform ${reportOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {reportOpen && (
                      <ul className="ml-8 mt-1 space-y-1">
                        {item.children.map((child) => (
                          <li key={child.path}>
                            <Link
                              href={child.path as any}
                              className={`block px-4 py-2 rounded-lg text-sm transition-all duration-200 font-medium ${
                                pathname === child.path
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'hover:bg-gray-100 hover:text-blue-600 text-gray-600'
                              }`}
                            >
                              {child.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              }
              return (
                <li key={item.path}>
                  <Link
                    href={item.path as any}
                    onClick={(e) => handleMenuClick(item.path, e)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium ${
                      pathname === item.path
                        ? 'bg-blue-50 text-blue-700 shadow-sm'
                        : 'hover:bg-gray-50 hover:text-blue-600'
                    }`}
                  >
                    <Icon className={`text-lg ${pathname === item.path ? 'text-blue-600' : 'text-gray-500'}`} />
                    <span>{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default Navigation; 