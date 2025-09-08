'use client';

import { useState, useEffect, useRef } from 'react';
import { LoanStatus } from '@/lib/models/loan';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const CONDITION_OPTIONS = [
  { label: '대출', value: 'loaned' },
  { label: '반납', value: 'returned' },
  { label: '전체', value: 'all' },
];

export default function LoanStatusPage() {
  const { isLoggedIn } = useAuth();
  const [loans, setLoans] = useState<LoanStatus[]>([]);
  const [filteredLoans, setFilteredLoans] = useState<LoanStatus[]>([]);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [condition, setCondition] = useState<'loaned' | 'returned' | 'all'>('loaned');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [itemsPerPage] = useState<number>(50);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // 기본 날짜 설정 (6개월 전부터 오늘까지)
  useEffect(() => {
    const today = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(today.getMonth() - 6);
    
    setEndDate(today.toISOString().split('T')[0]);
    setStartDate(sixMonthsAgo.toISOString().split('T')[0]);
  }, []);

  // 검색 필드에 기본 포커스 설정
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  // loans, condition, searchTerm, startDate, endDate가 바뀔 때마다 filteredLoans 계산
  useEffect(() => {
    let result = [...loans];
    if (condition === 'loaned') {
      result = result.filter(loan => loan.closedate === null);
    } else if (condition === 'returned') {
      result = result.filter(loan => loan.closedate !== null);
    }
    if (searchTerm) {
      result = result.filter(loan =>
        (loan.person_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (loan.book_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (loan.barcode?.toLowerCase() || '').includes(searchTerm.toLowerCase())
      );
    }
    if (startDate && endDate) {
      result = result.filter(loan => {
        if (!loan.outdate) return false;
        const loanDate = new Date(loan.outdate);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return loanDate >= start && loanDate <= end;
      });
    }
    setFilteredLoans(result);
  }, [loans, condition, searchTerm, startDate, endDate]);

  // filteredLoans가 바뀔 때 currentPage를 항상 1로 세팅
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredLoans]);

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/loanstatus');
      const data = await response.json();
      if (Array.isArray(data)) {
        setLoans(data);
      } else {
        setLoans([]);
        setError(data?.error || '데이터를 불러올 수 없습니다.');
      }
    } catch (_err) {
      setLoans([]);
      setError('Failed to fetch loan status');
    } finally {
      setLoading(false);
    }
  };

  // Pagination & currentItems 동기화
  const totalPages = Math.max(1, Math.ceil(filteredLoans.length / itemsPerPage));
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);
  const indexOfLastItem = safeCurrentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredLoans.slice(indexOfFirstItem, indexOfLastItem);

  // 페이지 이동 함수
  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (safeCurrentPage <= 4) {
        pages.push(1, '...', 3, 4, 5, 6, '...', totalPages);
      } else if (safeCurrentPage >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', safeCurrentPage - 1, safeCurrentPage, safeCurrentPage + 1, '...', totalPages);
      }
    }
    return [...new Set(pages)].filter(p => p === '...' || (typeof p === 'number' && p >= 1 && p <= totalPages));
  };

  // 조건부 렌더링은 모든 훅 아래에서만!
  if (!isLoggedIn) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">대출 현황</h1>
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded mb-4 inline-block">
          이 페이지는 로그인한 사용자만 볼 수 있습니다.
        </div>
        <button
          onClick={() => window.location.href = '/login'}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          로그인 페이지로 이동
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">대출 현황 📚</h1>
      </div>
      
      {/* CONDITION 옵션 */}
      <div className="mb-2 flex items-center space-x-4">
        <label className="text-sm font-medium text-gray-700">TYPE : </label>
        {CONDITION_OPTIONS.map(opt => (
          <label key={opt.value} className="inline-flex items-center space-x-1 cursor-pointer">
            <input
              type="radio"
              name="condition"
              value={opt.value}
              checked={condition === opt.value}
              onChange={() => setCondition(opt.value as 'loaned' | 'returned' | 'all')}
              className="form-radio text-blue-600"
            />
            <span>{opt.label}</span>
          </label>
        ))}
      </div>
      
      {/* 대출기간 필터 */}
      <div className="mb-4 flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">PERIOD : </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <span className="text-gray-500">~</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        {/* 빠른 필터 버튼들 */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              const today = new Date();
              const yesterday = new Date();
              yesterday.setDate(today.getDate() - 1);
              setStartDate(yesterday.toISOString().split('T')[0]);
              setEndDate(today.toISOString().split('T')[0]);
            }}
            className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
          >
            어제~오늘
          </button>
          <button
            onClick={() => {
              const today = new Date();
              const weekAgo = new Date();
              weekAgo.setDate(today.getDate() - 7);
              setStartDate(weekAgo.toISOString().split('T')[0]);
              setEndDate(today.toISOString().split('T')[0]);
            }}
            className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
          >
            최근 1주일
          </button>
          <button
            onClick={() => {
              const today = new Date();
              const monthAgo = new Date();
              monthAgo.setMonth(today.getMonth() - 1);
              setStartDate(monthAgo.toISOString().split('T')[0]);
              setEndDate(today.toISOString().split('T')[0]);
            }}
            className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
          >
            최근 1개월
          </button>
        </div>
      </div>
      
      {/* 대출 통계 */}
      <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="text-sm text-blue-600 font-medium">전체 대출</div>
          <div className="text-2xl font-bold text-blue-800">{filteredLoans.length}</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="text-sm text-green-600 font-medium">대출 중</div>
          <div className="text-2xl font-bold text-green-800">{filteredLoans.filter(loan => loan.closedate === null).length}</div>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
          <div className="text-sm text-orange-600 font-medium">반납 완료</div>
          <div className="text-2xl font-bold text-orange-800">{filteredLoans.filter(loan => loan.closedate !== null).length}</div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
          <div className="text-sm text-purple-600 font-medium">오늘 대출</div>
          <div className="text-2xl font-bold text-purple-800">
            {filteredLoans.filter(loan => {
              if (!loan.outdate) return false;
              const today = new Date();
              const loanDate = new Date(loan.outdate);
              return loanDate.toDateString() === today.toDateString();
            }).length}
          </div>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="mb-4">
        <input
          type="text"
          placeholder="교인명, 도서명 또는 BARCODE 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border rounded"
          ref={searchInputRef}
        />
      </div>
      
      {loading ? (
        <div className="p-4 text-center">Loading...</div>
      ) : (
        <>
          <div className="max-h-[600px] overflow-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-600 sticky top-0 z-10">
                <tr>
                  <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">No.</th>
                  <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">교인 ID</th>
                  <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">교인명</th>
                  <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">BARCODE</th>
                  <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">도서명</th>
                  <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">저자</th>
                  <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">대출일자</th>
                  <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">반납일</th>
                  <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">대출기간(일)</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentItems.map((loan, index) => {
                  let loanDays = '';
                  if (loan.outdate) {
                    const out = new Date(loan.outdate);
                    let end: Date;
                    if (loan.closedate) {
                      end = new Date(loan.closedate);
                    } else {
                      end = new Date();
                    }
                    const diff = Math.floor((end.getTime() - out.getTime()) / (1000 * 60 * 60 * 24));
                    loanDays = diff >= 0 ? diff.toString() : '';
                  }
                  return (
                    <tr key={`${loan.id}-${index}`} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-2 py-2 whitespace-nowrap text-sm">{indexOfFirstItem + index + 1}</td>
                      <td className="px-2 py-2 text-sm">{loan.id}</td>
                      <td className="px-2 py-2 text-sm max-w-[120px] truncate" title={loan.person_name}>{loan.person_name}</td>
                      <td className="px-2 py-2 text-sm">{loan.barcode}</td>
                      <td className="px-2 py-2 text-sm max-w-[220px] truncate" title={loan.book_name}>{loan.book_name}</td>
                      <td className="px-2 py-2 text-sm max-w-[150px] truncate" title={loan.author}>{loan.author}</td>
                      <td className="px-2 py-2 text-sm">{loan.outdate ? new Date(loan.outdate).toLocaleDateString() : ''}</td>
                      <td className="px-2 py-2 text-sm">{loan.closedate ? new Date(loan.closedate).toLocaleDateString() : ''}</td>
                      <td className="px-2 py-2 text-sm">{loanDays}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 flex items-center justify-center border-t border-gray-200">
              <nav className="inline-flex items-center space-x-1" aria-label="Pagination">
                <button
                  onClick={() => goToPage(safeCurrentPage - 1)}
                  disabled={safeCurrentPage === 1}
                  className={`flex items-center justify-center w-9 h-9 rounded-full border transition-all duration-150 ${safeCurrentPage === 1 ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : 'bg-white text-gray-600 border-gray-300 hover:bg-blue-50 hover:text-blue-600'}`}
                  aria-label="Previous"
                >
                  <FaChevronLeft />
                </button>
                {getPageNumbers().map((page, idx) =>
                  page === '...'
                    ? <span key={`ellipsis-${idx}`} className="px-2 text-gray-400">...</span>
                    : <button
                        key={`page-${page}`}
                        onClick={() => goToPage(Number(page))}
                        className={`w-9 h-9 rounded-full border transition-all duration-150 font-semibold ${
                          safeCurrentPage === page
                            ? 'bg-blue-600 text-white border-blue-600 shadow-lg'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:text-blue-600'
                        }`}
                      >
                        {page}
                      </button>
                )}
                <button
                  onClick={() => goToPage(safeCurrentPage + 1)}
                  disabled={safeCurrentPage === totalPages}
                  className={`flex items-center justify-center w-9 h-9 rounded-full border transition-all duration-150 ${safeCurrentPage === totalPages ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : 'bg-white text-gray-600 border-gray-300 hover:bg-blue-50 hover:text-blue-600'}`}
                  aria-label="Next"
                >
                  <FaChevronRight />
                </button>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
} 