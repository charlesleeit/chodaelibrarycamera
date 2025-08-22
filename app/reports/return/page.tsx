'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaBook, FaUser, FaTrophy, FaChevronLeft, FaChevronRight, FaCalendarAlt, FaFileAlt, FaEyeSlash } from 'react-icons/fa';
import PrintReport from '../../components/PrintReport';

interface BookStats {
  bookid: number;
  barcode: string;
  book_name: string;
  author?: string;
  persons: number;
}

interface PersonStats {
  person_id: number;
  person_name: string;
  books: number;
}

export default function LoanStatusIIPage() {
  const { isLoggedIn } = useAuth();
  const [bookStats, setBookStats] = useState<BookStats[]>([]);
  const [personStats, setPersonStats] = useState<PersonStats[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'books' | 'people'>('books');
  
  // 날짜 입력을 위한 상태
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  
  const [itemsPerPage] = useState<number>(20);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isReportView, setIsReportView] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  // 컴포넌트 마운트 시 기본 날짜 설정 (오늘 기준 6개월 전부터)
  useEffect(() => {
    const today = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(today.getMonth() - 6);
    
    setEndDate(today.toISOString().split('T')[0]);
    setStartDate(sixMonthsAgo.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    if (isLoggedIn && startDate && endDate) {
      fetchStats();
    }
  }, [isLoggedIn, startDate, endDate]);

  const fetchStats = async () => {
    if (!startDate || !endDate) return;
    
    setLoading(true);
    try {
      // TOP Books: 각 책별로 빌린 사람 수 (중복 제거)
      const bookResponse = await fetch(`/api/loanstats/books?startDate=${startDate}&endDate=${endDate}`);
      const bookData = await bookResponse.json();
      if (Array.isArray(bookData)) {
        setBookStats(bookData);
      } else {
        setBookStats([]);
        setError(bookData?.error || '책 통계를 불러올 수 없습니다.');
      }

      // TOP Members: 각 교인별로 빌린 책 수 (중복 제거)
      const personResponse = await fetch(`/api/loanstats/people?startDate=${startDate}&endDate=${endDate}`);
      const personData = await personResponse.json();
      if (Array.isArray(personData)) {
        setPersonStats(personData);
      } else {
        setPersonStats([]);
        setError(personData?.error || '사람 통계를 불러올 수 없습니다.');
      }
    } catch (err) {
      setError('통계를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 날짜 변경 시 통계 새로고침
  const handleDateChange = () => {
    if (startDate && endDate) {
      fetchStats();
    }
  };

  // Pagination & currentItems 동기화
  const currentStats = activeTab === 'books' ? bookStats : personStats;
  const totalPages = Math.max(1, Math.ceil(currentStats.length / itemsPerPage));
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);
  const indexOfLastItem = safeCurrentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = currentStats.slice(indexOfFirstItem, indexOfLastItem);

  // 페이지 이동 함수
  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  // 페이지 변경 시 currentPage를 1로 리셋
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

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
        <h1 className="text-2xl font-bold mb-4">대출 현황 II</h1>
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
             <div className="mb-4">
         <h1 className="text-2xl font-bold text-gray-800">대출 현황 II - TOP 리스트 📊</h1>
       </div>

      {/* 날짜 입력 옵션 */}
      <div className="mb-4 flex items-center space-x-4">
        <label className="text-sm font-medium text-gray-700">PERIOD :</label>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              onBlur={handleDateChange}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <FaCalendarAlt className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          <span className="text-gray-500">~</span>
          <div className="relative">
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              onBlur={handleDateChange}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <FaCalendarAlt className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
                 <button
           onClick={handleDateChange}
           className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors h-10"
         >
           조회
         </button>
                   <button
            onClick={() => setIsReportView(!isReportView)}
            className={`px-4 py-2 rounded-md transition-colors flex items-center justify-center h-10 ml-auto ${
              isReportView 
                ? 'bg-gray-600 text-white hover:bg-gray-700' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
            title={isReportView ? '일반 보기' : '리포트 보기'}
          >
            {isReportView ? <FaEyeSlash /> : <FaFileAlt />}
          </button>
      </div>

      {/* 탭 네비게이션 */}
      <div className="mb-4 flex items-center space-x-4">
        <label className="text-sm font-medium text-gray-700">TYPE : </label>
        <div className="flex space-x-4">
          <label className="inline-flex items-center space-x-1 cursor-pointer">
            <input
              type="radio"
              name="activeTab"
              value="books"
              checked={activeTab === 'books'}
              onChange={() => setActiveTab('books')}
              className="form-radio text-blue-600"
            />
            <span>TOP Books (책별 빌린 사람 수)</span>
          </label>
          <label className="inline-flex items-center space-x-1 cursor-pointer">
            <input
              type="radio"
              name="activeTab"
              value="people"
              checked={activeTab === 'people'}
              onChange={() => setActiveTab('people')}
              className="form-radio text-blue-600"
            />
            <span>TOP Members (교인별 빌린 책 수)</span>
          </label>
        </div>
      </div>

      {/* 통계 요약 */}
      <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="text-sm text-blue-600 font-medium">TOP Books</div>
          <div className="text-2xl font-bold text-blue-800">{bookStats.length}</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="text-sm text-green-600 font-medium">TOP Members</div>
          <div className="text-2xl font-bold text-green-800">{personStats.length}</div>
        </div>
                 <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
           <div className="text-sm text-orange-600 font-medium">시작일</div>
           <div className="text-lg font-bold text-orange-800">
             {startDate ? new Date(startDate).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }) : '-'}
           </div>
         </div>
         <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
           <div className="text-sm text-purple-600 font-medium">종료일</div>
           <div className="text-lg font-bold text-purple-800">
             {endDate ? new Date(endDate).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }) : '-'}
           </div>
         </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="p-4 text-center">Loading...</div>
      ) : (
        <>
          <div ref={printRef} className="max-h-[600px] overflow-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-600 sticky top-0 z-10">
                                 {activeTab === 'books' ? (
                   <tr>
                     <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">No.</th>
                     <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">순위</th>
                     <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">도서명</th>
                     <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">저자</th>
                     <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">BARCODE</th>
                     <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">빌린 사람 수</th>
                   </tr>
                ) : (
                  <tr>
                    <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">No.</th>
                    <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">순위</th>
                    <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">교인명</th>
                    <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">교인 ID</th>
                    <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">빌린 책 수</th>
                  </tr>
                )}
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentItems.map((item, index) => {
                  if (activeTab === 'books') {
                    const book = item as BookStats;
                    return (
                      <tr key={book.bookid} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-2 py-2 whitespace-nowrap text-sm">{indexOfFirstItem + index + 1}</td>
                        <td className="px-2 py-2 whitespace-nowrap">
                          {indexOfFirstItem + index < 3 ? (
                            <span className="flex items-center space-x-2">
                              <FaTrophy className={`text-lg ${indexOfFirstItem + index === 0 ? 'text-yellow-500' : indexOfFirstItem + index === 1 ? 'text-gray-400' : 'text-orange-500'}`} />
                              <span className="font-bold">{indexOfFirstItem + index + 1}</span>
                            </span>
                          ) : (
                            <span className="text-gray-600">{indexOfFirstItem + index + 1}</span>
                          )}
                        </td>
                                                 <td className="px-2 py-2 text-sm font-medium text-gray-900 max-w-[300px] truncate" title={book.book_name}>{book.book_name}</td>
                         <td className="px-2 py-2 text-sm max-w-[150px] truncate" title={book.author || ''}>{book.author || '-'}</td>
                         <td className="px-2 py-2 text-sm font-mono">{book.barcode}</td>
                        <td className="px-2 py-2 text-sm font-bold text-blue-600">{book.persons.toLocaleString()}명</td>
                      </tr>
                    );
                  } else {
                    const person = item as PersonStats;
                    return (
                      <tr key={person.person_id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-2 py-2 whitespace-nowrap text-sm">{indexOfFirstItem + index + 1}</td>
                        <td className="px-2 py-2 whitespace-nowrap">
                          {indexOfFirstItem + index < 3 ? (
                            <span className="flex items-center space-x-2">
                              <FaTrophy className={`text-lg ${indexOfFirstItem + index === 0 ? 'text-yellow-500' : indexOfFirstItem + index === 1 ? 'text-gray-400' : 'text-orange-500'}`} />
                              <span className="font-bold">{indexOfFirstItem + index + 1}</span>
                            </span>
                          ) : (
                            <span className="text-gray-600">{indexOfFirstItem + index + 1}</span>
                          )}
                        </td>
                        <td className="px-2 py-2 text-sm font-medium text-gray-900 max-w-[200px] truncate" title={person.person_name}>{person.person_name}</td>
                        <td className="px-2 py-2 text-sm font-mono">{person.person_id}</td>
                        <td className="px-2 py-2 text-sm font-bold text-green-600">{person.books.toLocaleString()}권</td>
                      </tr>
                    );
                  }
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

      {/* Report View Overlay */}
      {isReportView && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-4xl max-h-[90vh] overflow-y-auto">
                         <div className="flex justify-end items-center mb-6">
               <button
                 onClick={() => setIsReportView(false)}
                 className="text-gray-500 hover:text-gray-700 text-2xl"
               >
                 ×
               </button>
             </div>
            
            <PrintReport
              reportType={activeTab}
              topBooks={bookStats}
              topPeople={personStats}
              startDate={startDate}
              endDate={endDate}
              currentPage={currentPage}
              totalPages={totalPages}
            />
          </div>
        </div>
      )}
    </div>
  );
}
