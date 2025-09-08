'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '../context/AuthContext';
import { 
  FaHome, FaBook, FaExchangeAlt, FaUsers, FaBookDead, FaFileAlt, 
  FaChevronDown, FaBars, FaTimes, FaChartBar, FaCog, FaMapMarkerAlt,
  FaFolder, FaBriefcase, FaPaperPlane, FaClock, FaGem, FaTh,
  FaWindowMaximize, FaBell, FaQuestionCircle, FaEnvelope, FaUser, FaSignOutAlt
} from 'react-icons/fa';
import { useState, useEffect } from 'react';

const Navigation = () => {
  const pathname = usePathname();
  const { isLoggedIn, logout } = useAuth();
  const [reportOpen, setReportOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // 화면 크기 감지
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const handleMenuClick = (path: string, _e: React.MouseEvent) => {
    // Allow access to home page, takeout page, return page and book list without login
    if (path === '/' || path === '/takeout' || path === '/return' || path === '/books') return;
    
    // Redirect to login if not logged in
    if (!isLoggedIn) {
      // e.preventDefault();
      // router.push('/login');
    }
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setReportOpen(false);
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: FaHome, hasSubmenu: false },
    { name: 'Books', path: '/books', icon: FaBook, hasSubmenu: false },
    { name: 'Take Out', path: '/takeout', icon: FaBookDead, hasSubmenu: false },
    { name: 'Return', path: '/return', icon: FaExchangeAlt, hasSubmenu: false },
    {
      name: 'Reports',
      path: '/reports',
      icon: FaChartBar,
      hasSubmenu: true,
      children: [
        { name: '대출 현황', path: '/loanstatus' },
        { name: 'TOP LIST', path: '/reports/toplist' },
        { name: '반납 현황', path: '/reports/return' },
        { name: '카테고리 업데이트', path: '/reports/category-update' },
      ],
      requiresAuth: true,
    },
    { name: 'Users', path: '/users', icon: FaUsers, hasSubmenu: false, requiresAuth: true },
    { name: 'Settings', path: '/settings', icon: FaCog, hasSubmenu: false },
  ];

  // 모바일 햄버거 버튼
  if (isMobile) {
    return (
      <>
        {/* 모바일 햄버거 버튼 */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200 md:hidden"
        >
          {isMobileMenuOpen ? (
            <FaTimes className="text-gray-700 text-xl" />
          ) : (
            <FaBars className="text-gray-700 text-xl" />
          )}
        </button>

        {/* 모바일 메뉴 오버레이 */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden" onClick={closeMobileMenu} />
        )}

        {/* 모바일 사이드바 */}
        <div className={`fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-white to-gray-50 border-r border-gray-200 text-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out z-50 md:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
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
              <button
                onClick={closeMobileMenu}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <FaTimes className="text-gray-700 text-xl" />
              </button>
            </div>
            <nav>
              <ul className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.path || pathname.startsWith(item.path);
                  
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
                            isActive
                              ? 'bg-blue-50 text-blue-700 shadow-sm'
                              : 'hover:bg-gray-50 hover:text-blue-600'
                          }`}
                        >
                          <Icon className={`text-lg ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                          <span>{item.name}</span>
                          <FaChevronDown className={`ml-auto transition-transform ${reportOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {reportOpen && (
                          <ul className="ml-8 mt-1 space-y-1">
                            {item.children.map((child) => (
                              <li key={child.path}>
                                <Link
                                  href={child.path as any}
                                  onClick={closeMobileMenu}
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
                        onClick={(e) => {
                          handleMenuClick(item.path, e);
                          closeMobileMenu();
                        }}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium ${
                          isActive
                            ? 'bg-blue-50 text-blue-700 shadow-sm'
                            : 'hover:bg-gray-50 hover:text-blue-600'
                        }`}
                      >
                        <Icon className={`text-lg ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
            
            {/* Mobile Sign In/Out Toggle Button */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              {isLoggedIn ? (
                <button
                  onClick={() => {
                    logout();
                    closeMobileMenu();
                    console.log('User logged out successfully');
                  }}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg w-full transition-all duration-200 font-medium hover:bg-red-50 text-gray-700 hover:text-red-600 border border-gray-200 hover:border-red-300"
                >
                  <FaSignOutAlt className="text-lg text-gray-500" />
                  <span>Sign Out</span>
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={closeMobileMenu}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg w-full transition-all duration-200 font-medium hover:bg-green-50 text-gray-700 hover:text-green-600 border border-gray-200 hover:border-green-300"
                >
                  <FaUser className="text-lg text-gray-500" />
                  <span>Sign In</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </>
    );
  }

  // 데스크톱 사이드바 - Fancy Design
  return (
    <div className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-slate-800 via-slate-700 to-slate-800 text-white shadow-2xl transition-all duration-300 ${
      isSidebarCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>
      
      <div className="relative z-10 p-6 h-full flex flex-col">
        {/* Logo Section */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            {!isSidebarCollapsed && <span className="text-xl font-bold text-white">Pluto</span>}
          </div>
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-slate-600/50 rounded-lg transition-colors"
          >
            <FaBars className="text-slate-300 text-lg" />
          </button>
        </div>

        {/* User Profile Section - Hidden for now, will be used later */}
        {false && !isSidebarCollapsed && (
          <div className="bg-slate-600/30 rounded-xl p-4 mb-6 backdrop-blur-sm">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                <FaUser className="text-white text-lg" />
              </div>
              <div>
                <div className="text-white font-medium">John David</div>
                <div className="flex items-center space-x-2 text-green-400 text-sm">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Online</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Collapsed User Profile - Hidden for now */}
        {false && isSidebarCollapsed && (
          <div className="bg-slate-600/30 rounded-xl p-3 mb-6 backdrop-blur-sm flex justify-center">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
              <FaUser className="text-white text-lg" />
            </div>
          </div>
        )}


        {/* Navigation Menu */}
        <nav className="flex-1">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path || pathname.startsWith(item.path);
              
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
                      className={`group flex items-center ${isSidebarCollapsed ? 'justify-center px-3' : 'justify-between px-4'} py-3 rounded-lg w-full transition-all duration-200 font-medium ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                          : 'hover:bg-slate-600/50 text-slate-300 hover:text-white'
                      }`}
                      title={isSidebarCollapsed ? item.name : ''}
                    >
                      <div className={`flex items-center ${isSidebarCollapsed ? '' : 'space-x-3'}`}>
                        <Icon className={`text-lg ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                        {!isSidebarCollapsed && <span>{item.name}</span>}
                      </div>
                      {!isSidebarCollapsed && (
                        <FaChevronDown className={`text-slate-400 text-xs transition-transform ${reportOpen ? 'rotate-180' : ''}`} />
                      )}
                    </button>
                    {!isSidebarCollapsed && reportOpen && (
                      <ul className="ml-4 mt-1 space-y-1">
                        {item.children.map((child) => (
                          <li key={child.path}>
                            <Link
                              href={child.path as any}
                              className={`block px-4 py-2 rounded-lg text-sm transition-all duration-200 font-medium ${
                                pathname === child.path
                                  ? 'bg-blue-500/20 text-blue-300'
                                  : 'hover:bg-slate-600/30 hover:text-white text-slate-400'
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
                    className={`group flex items-center ${isSidebarCollapsed ? 'justify-center px-3' : 'space-x-3 px-4'} py-3 rounded-lg transition-all duration-200 font-medium ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                        : 'hover:bg-slate-600/50 text-slate-300 hover:text-white'
                    }`}
                    title={isSidebarCollapsed ? item.name : ''}
                  >
                    <Icon className={`text-lg ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                    {!isSidebarCollapsed && <span>{item.name}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Sign In/Out Toggle Button */}
        <div className="mt-auto pt-4">
          {isLoggedIn ? (
            <button
              onClick={() => {
                logout();
                console.log('User logged out successfully');
              }}
              className={`group flex items-center ${isSidebarCollapsed ? 'justify-center px-3' : 'space-x-3 px-4'} py-3 rounded-lg w-full transition-all duration-200 font-medium hover:bg-red-600/20 text-slate-300 hover:text-red-400 border border-slate-600 hover:border-red-500`}
              title={isSidebarCollapsed ? 'Sign Out' : ''}
            >
              <FaSignOutAlt className="text-lg text-slate-400 group-hover:text-red-400" />
              {!isSidebarCollapsed && <span>Sign Out</span>}
            </button>
          ) : (
            <Link
              href="/login"
              className={`group flex items-center ${isSidebarCollapsed ? 'justify-center px-3' : 'space-x-3 px-4'} py-3 rounded-lg w-full transition-all duration-200 font-medium hover:bg-green-600/20 text-slate-300 hover:text-green-400 border border-slate-600 hover:border-green-500`}
              title={isSidebarCollapsed ? 'Sign In' : ''}
            >
              <FaUser className="text-lg text-slate-400 group-hover:text-green-400" />
              {!isSidebarCollapsed && <span>Sign In</span>}
            </Link>
          )}
        </div>

      </div>
    </div>
  );
};

export default Navigation; 