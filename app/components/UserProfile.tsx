'use client';

import { useAuth } from '../context/AuthContext';
import Link from 'next/link';

const UserProfile = () => {
  const { isLoggedIn, userName } = useAuth();

  // 사용자 이름에서 이니셜 추출하는 함수
  const getInitials = (name: string) => {
    if (!name) return 'U';
    const words = name.trim().split(' ');
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
  };

  const displayName = isLoggedIn ? (userName || 'John David') : 'GUEST';
  const initials = isLoggedIn ? getInitials(displayName) : 'G';

  if (!isLoggedIn) {
    return (
      <Link href="/login" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-medium">
            {initials}
          </span>
        </div>
        <div className="hidden md:block">
          <div className="text-sm font-medium text-gray-900">
            {displayName}
          </div>
          <div className="text-xs text-gray-500">
            Click to sign in
          </div>
        </div>
        <div className="p-1 text-gray-600">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </Link>
    );
  }

  return (
    <div className="flex items-center space-x-3">
      <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
        <span className="text-white text-sm font-medium">
          {initials}
        </span>
      </div>
      <div className="hidden md:block">
        <div className="text-sm font-medium text-gray-900">
          {displayName}
        </div>
        <div className="text-xs text-gray-500">
          Administrator
        </div>
      </div>
      <button className="p-1 text-gray-600 hover:text-gray-900">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>
  );
};

export default UserProfile;