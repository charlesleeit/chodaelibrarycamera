'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaBook, FaUser, FaTrophy, FaChevronLeft, FaChevronRight, FaCalendarAlt, FaPrint } from 'react-icons/fa';
import PrintReport from '../../components/PrintReport';

interface BookStats {
  bookid: number;
  barcode: string;
  book_name: string;
  author: string;
  persons: number;
}

interface PersonStats {
  person_id: number;
  person_name: string;
  mobilenum: string;
  email: string;
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
  
  // 리포트 보기 관련 상태 추가
  const [isReportView, setIsReportView] = useState(false);

  // 프린트 기능 추가
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${activeTab === 'books' ? 'TOP BOOKS' : 'TOP MEMBERS'} Report</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 10px; min-height: 100vh; display: flex; flex-direction: column; }
              .header { text-align: center; margin-bottom: 20px; }
              .title { font-size: 24px; font-weight: bold; margin-bottom: 15px; }
              .info-row { display: flex; justify-content: space-between; margin-bottom: 20px; }
              .period { font-weight: bold; }
              .date-time { text-align: right; font-family: monospace; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 20px; flex: 1; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; font-weight: bold; }
              .footer { text-align: center; margin-top: auto; padding-top: 30px; font-size: 12px; }
              @media print { body { margin: 0; } }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="title">${activeTab === 'books' ? 'TOP BOOKS' : 'TOP MEMBERS'}</div>
              <div class="info-row">
                <div class="period">PERIOD : ${startDate ? new Date(startDate).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }) : ''} ~ ${endDate ? new Date(endDate).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }) : ''}</div>
                <div class="date-time">
                  <div>DATE : ${new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}</div>
                  <div>TIME : ${new Date().toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
                </div>
              </div>
            </div>
            
            <table>
              <thead>
                <tr>
                  <th>순위</th>
                  ${activeTab === 'books' ? `
                    <th>BARCODE</th>
                    <th>도서명</th>
                    <th>저자</th>
                    <th>빌린 사람 수</th>
                  ` : `
                    <th>교인 ID</th>
                    <th>교인명</th>
                    <th>전화번호</th>
                    <th>이메일</th>
                    <th>빌린 책 수</th>
                  `}
                </tr>
              </thead>
              <tbody>
                ${activeTab === 'books' ?
                  bookStats.map((book, index) => `
                    <tr>
                      <td>${index + 1}</td>
                      <td>${book.barcode}</td>
                      <td>${book.book_name}</td>
                      <td>${book.author}</td>
                      <td>${book.persons}명</td>
                    </tr>
                  `).join('') :
                  personStats.map((person, index) => `
                    <tr>
                      <td>${index + 1}</td>
                      <td>${person.person_id}</td>
                      <td>${person.person_name}</td>
                      <td>${person.mobilenum || '-'}</td>
                      <td>${person.email || '-'}</td>
                      <td>${person.books}권</td>
                    </tr>
                  `).join('')
                }
              </tbody>
            </table>
            
            <div class="footer">
              ${currentPage} / ${Math.ceil((activeTab === 'books' ? bookStats.length : personStats.length) / itemsPerPage)}
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
  };

  // 기본 날짜 설정 (6개월 전부터 오늘까지)
  useEffect(() => {
    const today = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(today.getMonth() - 6);
    
    setEndDate(today.toISOString().split('T')[0]);
    setStartDate(sixMonthsAgo.toISOString().split('T')[0]);
  }, []);

  // activeTab이 바뀔 때 currentPage를 1로 리셋
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const fetchData = async () => {
    if (!startDate || !endDate) return;
    
    setLoading(true);
    setError('');
    
    try {
      if (activeTab === 'books') {
        const response = await fetch(`/api/loanstats/books?startDate=${startDate}&endDate=${endDate}`);
        const data = await response.json();
        if (Array.isArray(data)) {
          setBookStats(data);
        } else {
          setBookStats([]);
          setError(data?.error || '도서 통계를 불러올 수 없습니다.');
        }
      } else {
        const response = await fetch(`/api/loanstats/people?startDate=${startDate}&endDate=${endDate}`);
        const data = await response.json();
        if (Array.isArray(data)) {
          setPersonStats(data);
        } else {
          setPersonStats([]);
          setError(data?.error || '교인 통계를 불러올 수 없습니다.');
        }
      }
    } catch (err) {
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
      if (activeTab === 'books') {
        setBookStats([]);
      } else {
        setPersonStats([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuery = () => {
    if (!startDate || !endDate) {
      setError('시작일과 종료일을 모두 입력해주세요.');
      return;
    }
    fetchData();
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <FaTrophy className="text-yellow-500" />;
    if (rank === 2) return <FaTrophy className="text-gray-400" />;
    if (rank === 3) return <FaTrophy className="text-amber-600" />;
    return null;
  };

  // Pagination 계산
  const totalItems = activeTab === 'books' ? bookStats.length : personStats.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfFirstItem = (currentPage - 1) * itemsPerPage;
  const currentItems = activeTab === 'books' 
    ? bookStats.slice(indexOfFirstItem, indexOfFirstItem + itemsPerPage)
    : personStats.slice(indexOfFirstItem, indexOfFirstItem + itemsPerPage);

  const goToPage = (page: number) => {
    const safePage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(safePage);
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">로그인이 필요합니다</h1>
          <p className="text-gray-600">이 페이지에 접근하려면 로그인해주세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">대출 현황 II - TOP 리스트</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Date Input and Query */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <FaCalendarAlt className="text-gray-400" />
              <span className="text-sm font-medium text-gray-700">기간:</span>
            </div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="text-gray-500">~</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleQuery}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
            >
              조회
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200 flex items-center space-x-2"
            >
              <FaPrint className="w-4 h-4" />
              <span>프린트</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('books')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'books'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FaBook className="inline mr-2" />
                TOP Books
              </button>
              <button
                onClick={() => setActiveTab('people')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'people'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FaUser className="inline mr-2" />
                TOP Members
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">데이터를 불러오는 중...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-600">{error}</p>
              </div>
            ) : (
              <>
                {/* Data Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-600 sticky top-0 z-10">
                      <tr>
                        <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">순위</th>
                        {activeTab === 'books' ? (
                          <>
                            <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">BARCODE</th>
                            <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">도서명</th>
                            <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">저자</th>
                            <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">빌린 사람 수</th>
                          </>
                        ) : (
                          <>
                            <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">교인 ID</th>
                            <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">교인명</th>
                            <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">전화번호</th>
                            <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">이메일</th>
                            <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">빌린 책 수</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentItems.map((item, index) => {
                        if (activeTab === 'books') {
                          const book = item as BookStats;
                          return (
                            <tr key={book.bookid} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                              <td className="px-2 py-2 text-sm">
                                <div className="flex items-center space-x-2">
                                  <span>{indexOfFirstItem + index + 1}</span>
                                  {getRankIcon(indexOfFirstItem + index + 1)}
                                </div>
                              </td>
                              <td className="px-2 py-2 text-sm font-mono">{book.barcode}</td>
                              <td className="px-2 py-2 text-sm font-medium text-gray-900 max-w-[200px] truncate" title={book.book_name}>{book.book_name}</td>
                              <td className="px-2 py-2 text-sm font-medium text-gray-900 max-w-[150px] truncate" title={book.author}>{book.author}</td>
                              <td className="px-2 py-2 text-sm font-bold text-blue-600">{book.persons.toLocaleString()}명</td>
                            </tr>
                          );
                        } else {
                          const person = item as PersonStats;
                          return (
                            <tr key={person.person_id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                              <td className="px-2 py-2 text-sm">
                                <div className="flex items-center space-x-2">
                                  <span>{indexOfFirstItem + index + 1}</span>
                                  {getRankIcon(indexOfFirstItem + index + 1)}
                                </div>
                              </td>
                              <td className="px-2 py-2 text-sm font-mono">{person.person_id}</td>
                              <td className="px-2 py-2 text-sm font-medium text-gray-900 max-w-[200px] truncate" title={person.person_name}>{person.person_name}</td>
                              <td className="px-2 py-2 text-sm font-mono">{person.mobilenum || '-'}</td>
                              <td className="px-2 py-2 text-sm max-w-[250px] truncate" title={person.email}>{person.email || '-'}</td>
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
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`flex items-center justify-center w-9 h-9 rounded-full border transition-all duration-150 ${currentPage === 1 ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : 'bg-white text-gray-600 border-gray-300 hover:bg-blue-50 hover:text-blue-600'}`}
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
                                currentPage === page
                                  ? 'bg-blue-600 text-white border-blue-600 shadow-lg'
                                  : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:text-blue-600'
                              }`}
                            >
                              {page}
                            </button>
                      )}
                      <button
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`flex items-center justify-center w-9 h-9 rounded-full border transition-all duration-150 ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : 'bg-white text-gray-600 border-gray-300 hover:bg-blue-50 hover:text-blue-600'}`}
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
        </div>

        {/* Print Report Modal */}
        {isReportView && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">프린트 보기</h2>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handlePrint}
                    className="p-2 text-blue-600 hover:text-blue-700 focus:outline-none"
                    title="Print"
                  >
                    <FaPrint className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setIsReportView(false)}
                    className="text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
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
          </div>
        )}
      </div>
    </div>
  );
}