'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  isLoggedIn: boolean;
  user: string | null; // id
  userName: string | null; // name
  login: (user: string, userName: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is logged in from localStorage on initial load
    const loginStatus = localStorage.getItem('isLoggedIn');
    const storedUser = localStorage.getItem('user');
    const storedUserName = localStorage.getItem('userName');
    if (loginStatus === 'true' && storedUser && storedUserName) {
      setIsLoggedIn(true);
      setUser(storedUser);
      setUserName(storedUserName);
    }
  }, []);

  const login = (user: string, userName: string) => {
    setIsLoggedIn(true);
    setUser(user);
    setUserName(userName);
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('user', user);
    localStorage.setItem('userName', userName);
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUser(null);
    setUserName(null);
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    localStorage.removeItem('userName');
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, userName, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 