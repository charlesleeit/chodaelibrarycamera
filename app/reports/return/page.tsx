'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaTrophy, FaMedal, FaCalendarAlt, FaSearch, FaChartBar } from 'react-icons/fa';
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
  const [activeTab, setActiveTab] = useState<'books' | 'people'>('books');
  
  // 날짜 입력을 위한 상태
  const [startDate, setStartDate] = useState<string>('02/23/2025');
  const [endDate, setEndDate] = useState<string>('08/22/2025');
  
  const [itemsPerPage] = useState<number>(20);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // 기본 날짜 설정
  useEffect(() => {
    const today = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(today.getMonth() - 6);
    
    setEndDate(formatDateForDisplay(today));
    setStartDate(formatDateForDisplay(sixMonthsAgo));
  }, []);

  // activeTab이 바뀔 때 currentPage를 1로 리셋
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const formatDateForDisplay = (date: Date): string => {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  const formatDateForAPI = (dateString: string): string => {
    const [month, day, year] = dateString.split('/');
    return `${year}-${month}-${day}`;
  };

  const fetchData = async () => {
    if (!startDate || !endDate) return;
    
    setLoading(true);
    setError('');
    
    try {
      if (activeTab === 'books') {
        const response = await fetch(`/api/loanstats/books?startDate=${formatDateForAPI(startDate)}&endDate=${formatDateForAPI(endDate)}`);
        const data = await response.json();
        
        if (data.success) {
          setBookStats(data.data || []);
        } else {
          setError(data.message || 'Failed to fetch book statistics');
        }
      } else {
        const response = await fetch(`/api/loanstats/people?startDate=${formatDateForAPI(startDate)}&endDate=${formatDateForAPI(endDate)}`);
        const data = await response.json();
        
        if (data.success) {
          setPersonStats(data.data || []);
        } else {
          setError(data.message || 'Failed to fetch person statistics');
        }
      }
    } catch (error) {
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <FaTrophy className="text-yellow-500 text-lg" />;
    if (rank === 2) return <FaMedal className="text-gray-400 text-lg" />;
    if (rank === 3) return <FaMedal className="text-amber-600 text-lg" />;
    return <span className="text-gray-500 text-lg">{rank}</span>;
  };

  if (!isLoggedIn) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">TOP LIST</h1>
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
    <>
      <Navigation />
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <span className="text-4xl">📊</span>
            TOP LIST
          </h1>
        </div>

        {/* PERIOD 필터 */}
        <div className="mb-6 flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">PERIOD : </label>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <input
                type="text"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="MM/DD/YYYY"
                className="pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            <span className="text-gray-500 text-lg">~</span>
            <div className="relative">
              <input
                type="text"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="MM/DD/YYYY"
                className="pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          <button
            onClick={fetchData}
            disabled={loading || !startDate || !endDate}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <FaSearch />
            조회
          </button>
        </div>

        {/* TYPE 선택 */}
        <div className="mb-6 flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">TYPE : </label>
          <label className="inline-flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              name="type"
              value="books"
              checked={activeTab === 'books'}
              onChange={() => setActiveTab('books')}
              className="form-radio text-blue-600"
            />
            <span className="text-sm">TOP Books</span>
          </label>
          <label className="inline-flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              name="type"
              value="people"
              checked={activeTab === 'people'}
              onChange={() => setActiveTab('people')}
              className="form-radio text-blue-600"
            />
            <span className="text-sm">TOP Members</span>
          </label>
        </div>

        {/* 요약 카드들 */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <div className="text-sm text-blue-600 font-medium mb-1">TOP Books</div>
            <div className="text-3xl font-bold text-blue-800">{bookStats.length}</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <div className="text-sm text-green-600 font-medium mb-1">TOP Members</div>
            <div className="text-3xl font-bold text-green-800">{personStats.length}</div>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
            <div className="text-sm text-orange-600 font-medium mb-1">시작일</div>
            <div className="text-lg font-bold text-orange-800">{startDate}</div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
            <div className="text-sm text-purple-600 font-medium mb-1">종료일</div>
            <div className="text-lg font-bold text-purple-800">{endDate}</div>
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
          <div className="max-h-[600px] overflow-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-600 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">NO.</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">순위</th>
                  {activeTab === 'books' ? (
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
                {activeTab === 'books' ? (
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
        {((activeTab === 'books' && bookStats.length === 0) || (activeTab === 'people' && personStats.length === 0)) && !loading && !error && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">데이터가 없습니다.</p>
          </div>
        )}
      </div>
    </>
  );
}