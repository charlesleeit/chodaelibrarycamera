'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaTrophy, FaCalendarAlt, FaPrint, FaChartBar } from 'react-icons/fa';
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

export default function TopListPage() {
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
        
        if (data.success) {
          setBookStats(data.data || []);
        } else {
          setError(data.message || 'Failed to fetch book statistics');
        }
      } else {
        const response = await fetch(`/api/loanstats/people?startDate=${startDate}&endDate=${endDate}`);
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
    if (rank === 1) return <FaTrophy className="text-yellow-500" />;
    if (rank === 2) return <FaTrophy className="text-gray-400" />;
    if (rank === 3) return <FaTrophy className="text-amber-600" />;
    return null;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  if (!isLoggedIn) {
    return <div className="min-h-screen flex items-center justify-center">Login required.</div>;
  }

  return (
    <>
      {/* TOP LIST 제목 */}
      <div className="bg-white shadow-md p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FaChartBar className="text-3xl text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-800">TOP LIST</h1>
          </div>
          <button
            onClick={() => setIsReportView(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center space-x-2"
          >
            <FaPrint className="text-lg" />
            <span>Print</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 조회 및 필터링 섹션 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* PERIOD 섹션 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">PERIOD</label>
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <FaCalendarAlt className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
                <span className="text-gray-500">~</span>
                <div className="relative flex-1">
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <FaCalendarAlt className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>
            </div>

            {/* TYPE 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">TYPE</label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="books"
                    checked={activeTab === 'books'}
                    onChange={(e) => setActiveTab(e.target.value as 'books' | 'people')}
                    className="mr-2 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">TOP Books</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="people"
                    checked={activeTab === 'people'}
                    onChange={(e) => setActiveTab(e.target.value as 'books' | 'people')}
                    className="mr-2 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">TOP Members</span>
                </label>
              </div>
            </div>
          </div>

          {/* 조회 버튼 */}
          <div className="mt-6">
            <button
              onClick={fetchData}
              disabled={loading || !startDate || !endDate}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading...' : '조회'}
            </button>
          </div>
        </div>

        {/* 요약 정보 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-500 text-white rounded-lg p-4 text-center">
            <h3 className="text-sm font-medium mb-1">TOP Books</h3>
            <p className="text-2xl font-bold">{bookStats.length}</p>
          </div>
          <div className="bg-green-500 text-white rounded-lg p-4 text-center">
            <h3 className="text-sm font-medium mb-1">TOP Members</h3>
            <p className="text-2xl font-bold">{personStats.length}</p>
          </div>
          <div className="bg-orange-500 text-white rounded-lg p-4 text-center">
            <h3 className="text-sm font-medium mb-1">시작일</h3>
            <p className="text-lg font-semibold">{startDate ? formatDate(startDate) : '-'}</p>
          </div>
          <div className="bg-purple-500 text-white rounded-lg p-4 text-center">
            <h3 className="text-sm font-medium mb-1">종료일</h3>
            <p className="text-lg font-semibold">{endDate ? formatDate(endDate) : '-'}</p>
          </div>
        </div>

        {/* 데이터 테이블 */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">NO.</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">순위</th>
                  {activeTab === 'books' ? (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">BARCODE</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">도서명</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">저자</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">빌린 사람 수</th>
                    </>
                  ) : (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">교인 ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">교인명</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">전화번호</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">이메일</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">빌린 책 수</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {activeTab === 'books' ? (
                  bookStats.map((book, index) => (
                    <tr key={book.bookid} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center space-x-2">
                          <span>{index + 1}</span>
                          {getRankIcon(index + 1)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">{book.barcode}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 max-w-[300px] truncate" title={book.book_name}>{book.book_name}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-[200px] truncate" title={book.author}>{book.author}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">{book.persons.toLocaleString()}명</td>
                    </tr>
                  ))
                ) : (
                  personStats.map((person, index) => (
                    <tr key={person.person_id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center space-x-2">
                          <span>{index + 1}</span>
                          {getRankIcon(index + 1)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">{person.person_id}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 max-w-[200px] truncate" title={person.person_name}>{person.person_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">{person.mobilenum || '-'}</td>
                      <td className="px-6 py-4 text-sm max-w-[250px] truncate" title={person.email}>{person.email || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">{person.books.toLocaleString()}권</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* 데이터가 없을 때 */}
          {((activeTab === 'books' && bookStats.length === 0) || (activeTab === 'people' && personStats.length === 0)) && !loading && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">데이터가 없습니다.</p>
            </div>
          )}

          {/* 로딩 상태 */}
          {loading && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">데이터를 불러오는 중...</p>
            </div>
          )}

          {/* 에러 메시지 */}
          {error && (
            <div className="text-center py-12">
              <p className="text-red-500 text-lg">{error}</p>
            </div>
          )}
        </div>
      </div>

      {/* PrintReport 모달 */}
      {isReportView && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-semibold text-gray-800">Print Preview</h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center space-x-2"
                >
                  <FaPrint className="text-lg" />
                  <span>Print</span>
                </button>
                <button
                  onClick={() => setIsReportView(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Close
                </button>
              </div>
            </div>
            <div className="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
              <PrintReport
                reportType={activeTab}
                topBooks={bookStats}
                topPeople={personStats}
                startDate={startDate}
                endDate={endDate}
                currentPage={currentPage}
                totalPages={Math.ceil((activeTab === 'books' ? bookStats.length : personStats.length) / itemsPerPage)}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
