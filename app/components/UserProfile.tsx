'use client';

import { FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function UserProfile() {
  const { isLoggedIn, userName, logout } = useAuth();
  const router = useRouter();
  if (!isLoggedIn || !userName) return null;
  const handleLogout = () => {
    logout();
    router.push('/login');
  };
  return (
    <div className="absolute top-4 right-8 flex items-center space-x-2 z-50">
      <FaUserCircle className="text-2xl text-gray-500" />
      <span className="font-semibold text-gray-700">{userName}</span>
      <button onClick={handleLogout} title="Log Out" className="ml-1 p-1 rounded hover:bg-gray-200 focus:outline-none">
        <FaSignOutAlt className="text-xl text-gray-500 hover:text-red-600" />
      </button>
    </div>
  );
} 