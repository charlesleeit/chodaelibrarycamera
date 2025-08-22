'use client';

import { FaUserCircle, FaSignOutAlt, FaSignInAlt, FaUserPlus, FaPowerOff } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function UserProfile() {
  const { isLoggedIn, userName, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleLogin = () => {
    router.push('/login');
  };

  return (
    <div className="absolute top-4 right-8 md:right-8 flex items-center space-x-3 z-40">
      {isLoggedIn && userName ? (
        // 로그인된 경우: 사용자명과 로그아웃 아이콘
        <>
          <FaUserCircle className="text-2xl text-gray-500" />
          <span className="font-semibold text-gray-700 hidden sm:inline">{userName}</span>
          <button 
            onClick={handleLogout} 
            title="Logout" 
            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
          >
            <FaPowerOff className="text-lg" />
          </button>
        </>
      ) : (
        // 로그인되지 않은 경우: 로그인 아이콘
        <button 
          onClick={handleLogin} 
          title="Login" 
          className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
        >
          <FaUserPlus className="text-lg" />
        </button>
      )}
    </div>
  );
} 