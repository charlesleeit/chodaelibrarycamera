'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaTrophy, FaMedal, FaCalendarAlt, FaSearch, FaPrint } from 'react-icons/fa';
import Navigation from '../../components/Navigation';

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

export default function TopListPage() {
  const { isLoggedIn } = useAuth();
  const [bookStats, setBookStats] = useState<BookStats[]>([]);
  const [personStats, setPersonStats] = useState<PersonStats[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [type, setType] = useState<'books' | 'members'>('books');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const printRef = useRef<HTMLDivElement>(null);

  // 기본 날짜 설정 - 이미지와 일치하도록 수정
  useEffect(() => {
    const today = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(today.getMonth() - 6);
    
    setEndDate(today.toISOString().split('T')[0]);
    setStartDate(sixMonthsAgo.toISOString().split('T')[0]);
  }, []);

  const handleSearch = async () => {
    if (!startDate || !endDate) {
      setError('시작일과 종료일을 모두 입력해주세요.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('Searching with:', { type, startDate, endDate });
      
      if (type === 'books') {
        const response = await fetch(`/api/loanstats/books?startDate=${startDate}&endDate=${endDate}`);
        console.log('Books API response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Books API response data:', data);
        
        if (data.success) {
          setBookStats(data.data || []);
          setError(''); // Clear any previous errors
        } else {
          setError(data.message || 'Failed to fetch book statistics');
        }
      } else {
        const response = await fetch(`/api/loanstats/people?startDate=${startDate}&endDate=${endDate}`);
        console.log('People API response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('People API response data:', data);
        
        if (data.success) {
          setPersonStats(data.data || []);
          setError(''); // Clear any previous errors
        } else {
          setError(data.message || 'Failed to fetch person statistics');
        }
      }
    } catch (err) {
      console.error('Search error:', err);
      setError(`데이터를 불러오는 중 오류가 발생했습니다: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (printRef.current) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${type === 'books' ? 'TOP BOOKS' : 'TOP MEMBERS'}</title>
              <style>
                body { 
                  margin: 0; 
                  padding: 5px; 
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                  font-size: 14px;
                  line-height: 1.4;
                }
                .print-header { 
                  text-align: center; 
                  margin-bottom: 15px; 
                  border-bottom: 2px solid #333; 
                  padding-bottom: 10px; 
                }
                .print-title { 
                  font-size: 28px; 
                  font-weight: bold; 
                  margin-bottom: 10px; 
                  color: #1f2937;
                }
                .print-info-container {
                  display: flex;
                  justify-content: space-between;
                  align-items: flex-start;
                  margin-bottom: 10px;
                }
                .print-info-left {
                  text-align: left;
                }
                .print-info-right {
                  text-align: right;
                }
                .print-info { 
                  font-size: 14px; 
                  color: #374151; 
                  margin-bottom: 4px; 
                  font-weight: 500;
                }
                .print-table { 
                  width: 100%; 
                  border-collapse: collapse; 
                  margin-top: 10px;
                  font-size: 14px;
                }
                .print-table th, .print-table td { 
                  border: 1px solid #d1d5db; 
                  padding: 6px 8px; 
                  text-align: left; 
                  vertical-align: top;
                }
                .print-table th { 
                  background-color: #f1f5f9; 
                  color: #1f2937; 
                  font-weight: bold; 
                  font-size: 12px;
                  text-transform: uppercase;
                  letter-spacing: 0.05em;
                }
                .print-table tr:nth-child(even) {
                  background-color: #f9fafb;
                }
                .print-table tr:nth-child(odd) {
                  background-color: white;
                }
                .print-barcode {
                  font-family: 'Courier New', monospace;
                  font-size: 13px;
                }
                .print-book-name {
                  max-width: 400px;
                  word-wrap: break-word;
                }
                .print-author {
                  max-width: 200px;
                  word-wrap: break-word;
                }
                .print-count {
                  font-weight: 600;
                  color: #2563eb;
                }
                .print-count-members {
                  font-weight: 600;
                  color: #059669;
                }
                @page { 
                  margin: 0.5cm; 
                  size: A4;
                }
                @media print {
                  body { 
                    -webkit-print-color-adjust: exact;
                    color-adjust: exact;
                  }
                  .print-table th {
                    -webkit-print-color-adjust: exact;
                    color-adjust: exact;
                  }
                  .print-table tr:nth-child(even) {
                    -webkit-print-color-adjust: exact;
                    color-adjust: exact;
                  }
                }
              </style>
            </head>
            <body>
              <div class="print-header">
                <div class="print-title">${type === 'books' ? 'TOP BOOKS' : 'TOP MEMBERS'}</div>
              </div>
              
              <div class="print-info-container">
                <div class="print-info-left">
                  <div class="print-info">PERIOD : ${startDate} ~ ${endDate}</div>
                </div>
                <div class="print-info-right">
                  <div class="print-info">DATE : ${endDate}</div>
                  <div class="print-info">TIME : ${new Date().toLocaleTimeString('ko-KR', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
                </div>
              </div>
              
              <table class="print-table">
                <thead>
                  <tr>
                    <th>순위</th>
                    ${type === 'books' ? `
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
                  ${type === 'books' 
                    ? bookStats.map((book, index) => `
                        <tr>
                          <td>${index + 1}</td>
                          <td class="print-barcode">${book.barcode}</td>
                          <td class="print-book-name">${book.book_name}</td>
                          <td class="print-author">${book.author}</td>
                          <td class="print-count">${book.persons}명</td>
                        </tr>
                      `).join('')
                    : personStats.map((person, index) => `
                        <tr>
                          <td>${index + 1}</td>
                          <td class="print-barcode">${person.person_id}</td>
                          <td class="print-book-name">${person.person_name}</td>
                          <td class="print-barcode">${person.mobilenum || '-'}</td>
                          <td class="print-author">${person.email || '-'}</td>
                          <td class="print-count-members">${person.books}권</td>
                        </tr>
                      `).join('')
                  }
                </tbody>
              </table>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <FaTrophy className="text-yellow-500 text-lg" />;
    if (rank === 2) return <FaMedal className="text-gray-400 text-lg" />;
    if (rank === 3) return <FaMedal className="text-amber-600 text-lg" />;
    return null;
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">로그인이 필요합니다</h1>
          <p className="text-gray-600">이 페이지에 접근하려면 로그인해주세요.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navigation />
      <div className="container mx-auto px-2 max-w-7xl">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            TOP LIST
          </h1>
          <button
            onClick={handlePrint}
            className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-full transition-colors"
            title="프린트"
          >
            <FaPrint className="w-5 h-5" />
          </button>
        </div>

        {/* PERIOD Filter */}
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

        {/* TYPE Selection */}
        <div className="mb-2 flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">TYPE : </label>
          <label className="inline-flex items-center space-x-1 cursor-pointer">
            <input
              type="radio"
              name="type"
              value="books"
              checked={type === 'books'}
              onChange={(e) => setType(e.target.value as 'books' | 'members')}
              className="form-radio text-blue-600"
            />
            <span className="text-sm">TOP Books</span>
          </label>
          <label className="inline-flex items-center space-x-1 cursor-pointer">
            <input
              type="radio"
              name="type"
              value="members"
              checked={type === 'members'}
              onChange={(e) => setType(e.target.value as 'books' | 'members')}
              className="form-radio text-blue-600"
            />
            <span className="text-sm">TOP Members</span>
          </label>
          
          <button
            onClick={handleSearch}
            disabled={loading || !startDate || !endDate}
            className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
          >
            <FaSearch />
            조회
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="p-4 text-center">Loading...</div>
        ) : (
          <div ref={printRef} className="max-h-[600px] overflow-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-600 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">NO.</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">순위</th>
                  {type === 'books' ? (
                    <>
                      <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">BARCODE</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">도서명</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">저자</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">빌린 사람 수</th>
                    </>
                  ) : (
                    <>
                      <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">교인 ID</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">교인명</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">전화번호</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">이메일</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">빌린 책 수</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {type === 'books' ? (
                  bookStats.map((book, index) => (
                    <tr key={book.bookid} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">{index + 1}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          {getRankIcon(index + 1)}
                          <span className="font-semibold">{index + 1}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-mono">{book.barcode}</td>
                      <td className="px-4 py-3 text-sm max-w-[300px] truncate" title={book.book_name}>
                        {book.book_name}
                      </td>
                      <td className="px-4 py-3 text-sm max-w-[150px] truncate" title={book.author}>
                        {book.author}
                      </td>
                      <td className="px-4 py-3 text-sm text-blue-600 font-semibold">
                        {book.persons}명
                      </td>
                    </tr>
                  ))
                ) : (
                  personStats.map((person, index) => (
                    <tr key={person.person_id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">{index + 1}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          {getRankIcon(index + 1)}
                          <span className="font-semibold">{index + 1}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-mono">{person.person_id}</td>
                      <td className="px-4 py-3 text-sm max-w-[150px] truncate" title={person.person_name}>
                        {person.person_name}
                      </td>
                      <td className="px-4 py-3 text-sm font-mono">{person.mobilenum || '-'}</td>
                      <td className="px-4 py-3 text-sm max-w-[200px] truncate" title={person.email}>
                        {person.email || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-green-600 font-semibold">
                        {person.books}권
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 데이터가 없을 때 */}
        {((type === 'books' && bookStats.length === 0) || (type === 'members' && personStats.length === 0)) && !loading && !error && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">데이터가 없습니다.</p>
          </div>
        )}
      </div>
    </>
  );
}

const TYPE_OPTIONS = [
  { label: 'TOP Books', value: 'books' },
  { label: 'TOP Members', value: 'members' },
];
