'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaTrophy, FaPrint, FaFileAlt, FaEyeSlash } from 'react-icons/fa';
import PrintReport from '../../components/PrintReport';

interface TopBook {
  bookid: number;
  barcode: string;
  book_name: string;
  persons: number;
}

interface TopPerson {
  person_id: number;
  person_name: string;
  books: number;
}

export default function TopListPage() {
  const { isLoggedIn } = useAuth();
  const [topBooks, setTopBooks] = useState<TopBook[]>([]);
  const [topPeople, setTopPeople] = useState<TopPerson[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportType, setReportType] = useState<'books' | 'people'>('books');
  const [isReportView, setIsReportView] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  // 기본 날짜 설정 (6개월 전부터 오늘까지)
  useEffect(() => {
    const today = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(today.getMonth() - 6);
    
    setEndDate(today.toISOString().split('T')[0]);
    setStartDate(sixMonthsAgo.toISOString().split('T')[0]);
  }, []);

  const fetchData = async () => {
    if (!startDate || !endDate) return;
    
    setLoading(true);
    setError('');
    
    try {
      if (reportType === 'books') {
        const response = await fetch(`/api/loanstats/books?startDate=${startDate}&endDate=${endDate}`);
        const data = await response.json();
        if (response.ok) {
          setTopBooks(data);
        } else {
          setError(data.error || '데이터를 불러올 수 없습니다.');
        }
      } else {
        const response = await fetch(`/api/loanstats/people?startDate=${startDate}&endDate=${endDate}`);
        const data = await response.json();
        if (response.ok) {
          setTopPeople(data);
        } else {
          setError(data.error || '데이터를 불러올 수 없습니다.');
        }
      }
    } catch (err) {
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [startDate, endDate, reportType]);

  const handlePrint = () => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>대출 현황 II - TOP 리스트</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
              table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; color: #000; }
              .header { text-align: center; margin-bottom: 30px; }
              .summary { display: flex; gap: 20px; margin-bottom: 30px; }
              .summary-card { flex: 1; padding: 15px; border: 1px solid #ddd; border-radius: 5px; text-align: center; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>대출 현황 II - TOP 리스트</h1>
              <p>${startDate && endDate ? `${formatDate(startDate)} ~ ${formatDate(endDate)}` : ''}</p>
              <p>생성일시: ${new Date().toLocaleString('ko-KR')}</p>
            </div>
            
            <div class="summary">
              <div class="summary-card">
                <h3>TOP Books</h3>
                <p style="font-size: 24px; font-weight: bold; color: #1e40af;">${topBooks.length}</p>
              </div>
              <div class="summary-card">
                <h3>TOP Members</h3>
                <p style="font-size: 24px; font-weight: bold; color: #059669;">${topPeople.length}</p>
              </div>
            </div>
            
            <h3>${reportType === 'books' ? 'TOP Books 상세' : 'TOP Members 상세'}</h3>
                         ${reportType === 'books' ? `
               <table>
                 <thead>
                   <tr>
                     <th>순위</th>
                     <th>도서명</th>
                     <th>BARCODE</th>
                     <th>빌린 사람 수</th>
                   </tr>
                 </thead>
                 <tbody>
                   ${topBooks.map((book, index) => `
                     <tr>
                       <td>${index + 1}</td>
                       <td>${book.book_name}</td>
                       <td>${book.barcode}</td>
                       <td>${book.persons}명</td>
                     </tr>
                   `).join('')}
                 </tbody>
               </table>
             ` : `
               <table>
                 <thead>
                   <tr>
                     <th>순위</th>
                     <th>교인명</th>
                     <th>빌린 책 수</th>
                   </tr>
                 </thead>
                 <tbody>
                   ${topPeople.map((person, index) => `
                     <tr>
                       <td>${index + 1}</td>
                       <td>${person.person_name}</td>
                       <td>${person.books}권</td>
                     </tr>
                   `).join('')}
                 </tbody>
               </table>
             `}
            
            <div class="footer">
              <p>이 리포트는 NJCHODAE 도서관 시스템에서 자동 생성되었습니다.</p>
            </div>
          </body>
        </html>
      `);
      
      printWindow.document.close();
      printWindow.focus();
      
      // Wait for content to load then print
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}. ${date.getMonth() + 1}. ${date.getDate()}.`;
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <FaTrophy className="text-yellow-500" />;
    if (rank === 2) return <FaTrophy className="text-gray-400" />;
    if (rank === 3) return <FaTrophy className="text-amber-600" />;
    return null;
  };

  // 페이지네이션 관련 함수들 (리포트용)
  const totalPages = Math.ceil((reportType === 'books' ? topBooks.length : topPeople.length) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  
  const currentBooks = topBooks.slice(startIndex, endIndex);
  const currentPeople = topPeople.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const goToPreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  // 페이지 변경 시 currentPage를 1로 리셋
  useEffect(() => {
    setCurrentPage(1);
  }, [reportType]);

  if (!isLoggedIn) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">대출 현황 II - TOP 리스트</h1>
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
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl font-bold text-gray-800">대출 현황 II - TOP 리스트</h1>
          <span className="text-gray-500">📊</span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Charles Lee</span>
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          </div>
        </div>
      </div>

             {/* Title with Print Button */}
       <div className="flex justify-between items-center mb-4">
         <h2 className="text-xl font-semibold text-gray-700">대출 현황 II</h2>
         <button
           onClick={handlePrint}
           className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
           title="프린트"
         >
           <FaFileAlt />
         </button>
       </div>

      {/* Control Panel */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                     {/* Date Range */}
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-2">PERIOD :</label>
             <div className="flex items-center space-x-2">
               <input
                 type="date"
                 value={startDate}
                 onChange={(e) => setStartDate(e.target.value)}
                 className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
               />
               <span className="text-gray-500">~</span>
               <input
                 type="date"
                 value={endDate}
                 onChange={(e) => setEndDate(e.target.value)}
                 className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
               />
               <button
                 onClick={fetchData}
                 className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
               >
                 조회
               </button>
             </div>
           </div>

          {/* Report Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">TYPE : </label>
            <div className="flex space-x-4">
              <label className="inline-flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="reportType"
                  value="books"
                  checked={reportType === 'books'}
                  onChange={() => setReportType('books')}
                  className="form-radio text-blue-600"
                />
                <span>TOP Books (책별 빌린 사람 수)</span>
              </label>
              <label className="inline-flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="reportType"
                  value="people"
                  checked={reportType === 'people'}
                  onChange={() => setReportType('people')}
                  className="form-radio text-blue-600"
                />
                <span>TOP Members (교인별 빌린 책 수)</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <div className="text-sm text-blue-600 font-medium mb-1">TOP Books</div>
          <div className="text-3xl font-bold text-blue-800">{topBooks.length}</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <div className="text-sm text-green-600 font-medium mb-1">TOP Members</div>
          <div className="text-3xl font-bold text-green-800">{topPeople.length}</div>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
          <div className="text-sm text-orange-600 font-medium mb-1">시작일</div>
          <div className="text-lg font-bold text-orange-800">{startDate ? formatDate(startDate) : '-'}</div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
          <div className="text-sm text-purple-600 font-medium mb-1">종료일</div>
          <div className="text-lg font-bold text-purple-800">{endDate ? formatDate(endDate) : '-'}</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-start items-center mb-4">
        <div className="flex space-x-2">
          <button
            onClick={() => setIsReportView(!isReportView)}
            className={`px-4 py-2 rounded-md transition-colors flex items-center justify-center ${
              isReportView 
                ? 'bg-gray-600 text-white hover:bg-gray-700' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
            title={isReportView ? '일반 보기' : '리포트 보기'}
          >
            {isReportView ? <FaEyeSlash /> : <FaFileAlt />}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Data Table */}
      <div ref={printRef} className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">데이터를 불러오는 중...</div>
        ) : (
          <>
                         {reportType === 'books' ? (
               <table className="min-w-full divide-y divide-gray-200">
                 <thead className="bg-gray-600">
                   <tr>
                     <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">순위</th>
                     <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">도서명</th>
                     <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">BARCODE</th>
                     <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">빌린 사람 수</th>
                   </tr>
                 </thead>
                                   <tbody className="bg-white divide-y divide-gray-200">
                    {topBooks.map((book, index) => (
                      <tr key={book.bookid} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center space-x-2">
                            <span>{index + 1}</span>
                            {getRankIcon(index + 1)}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 max-w-md truncate" title={book.book_name}>
                          {book.book_name}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{book.barcode}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{book.persons}명</td>
                      </tr>
                    ))}
                  </tbody>
               </table>
                         ) : (
               <table className="min-w-full divide-y divide-gray-200">
                 <thead className="bg-gray-600">
                   <tr>
                     <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">순위</th>
                     <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">교인명</th>
                     <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">빌린 책 수</th>
                   </tr>
                 </thead>
                                   <tbody className="bg-white divide-y divide-gray-200">
                    {topPeople.map((person, index) => (
                      <tr key={person.person_id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center space-x-2">
                            <span>{index + 1}</span>
                            {getRankIcon(index + 1)}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{person.person_name}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{person.books}권</td>
                      </tr>
                    ))}
                  </tbody>
               </table>
             )}
                     </>
         )}
       </div>



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
               reportType={reportType}
               topBooks={topBooks}
               topPeople={topPeople}
               startDate={startDate}
               endDate={endDate}
               currentPage={currentPage}
               totalPages={totalPages}
             />
            
            <div className="mt-6 text-center">
              <button
                onClick={handlePrint}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 mx-auto"
              >
                <FaPrint />
                <span>프린트</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
