'use client';

/**
 * Home Page Component
 * 
 * Main page of the NJCHODAE Library System.
 * Displays a list of books with sorting and searching capabilities.
 * Features:
 * - Book list with pagination
 * - Search functionality
 * - Sorting by various fields
 * - Status indicators for active/inactive books
 * 
 * @component
 */

import { useState } from 'react';
import Image from 'next/image';

export default function Home() {
  const [lang, setLang] = useState<'ko' | 'en'>('ko');

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white rounded-2xl shadow-xl p-10 w-full max-w-md relative">
        {/* 언어 선택 */}
        <div
          className="absolute top-4 right-6 flex items-center space-x-2 text-gray-600 text-sm cursor-pointer select-none"
          onClick={() => setLang(lang === 'ko' ? 'en' : 'ko')}
          title={lang === 'ko' ? 'Switch to English' : '한국어로 변경'}
        >
          <span className="bg-gray-100 rounded-full px-2 py-1">{lang === 'ko' ? 'kr' : 'us'}</span>
          <span>{lang === 'ko' ? '한국어' : 'English'}</span>
        </div>
        {/* 로고 */}
        <div className="flex flex-col items-center mb-6">
          <Image src="/njchodae-logo.png" alt="NJCHODAE" width={180} height={40} className="mb-2" />
          <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded">CHODAE COMMUNITY CHURCH</span>
        </div>
        {/* 책 아이콘 */}
        <div className="flex justify-center mb-4">
          <span style={{ fontSize: 48 }} role="img" aria-label="books">📚</span>
        </div>
        {/* 환영 메시지 */}
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
          {lang === 'ko' ? '도서관에 오신 것을 환영합니다!' : 'Welcome to the Library!'}
        </h1>
        <p className="text-center text-gray-500 mb-6">
          {lang === 'ko' ? '원하는 서비스를 선택해주세요.' : 'Please select the service you want.'}
        </p>
        {/* 버튼 */}
        <div className="flex justify-center space-x-4">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow transition-colors"
            onClick={() => window.location.href = '/takeout'}
          >
            {lang === 'ko' ? '도서 대여' : 'Borrow Book'}
          </button>
          <button
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg shadow transition-colors"
            onClick={() => window.location.href = '/return'}
          >
            {lang === 'ko' ? '도서 반납' : 'Return Book'}
          </button>
        </div>
      </div>
    </div>
  );
}
