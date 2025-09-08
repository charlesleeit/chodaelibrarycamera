'use client';

import { FaTrophy } from 'react-icons/fa';

interface TopBook {
  bookid: number;
  barcode: string;
  book_name: string;
  author: string;
  persons: number;
}

interface TopPerson {
  person_id: number;
  person_name: string;
  mobilenum?: string;
  email?: string;
  books: number;
}

interface PrintReportProps {
  reportType: 'books' | 'people';
  topBooks: TopBook[];
  topPeople: TopPerson[];
  startDate: string;
  endDate: string;
  currentPage?: number;
  totalPages?: number;
}

export default function PrintReport({ reportType, topBooks, topPeople, startDate, endDate, currentPage = 1, totalPages = 1 }: PrintReportProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <FaTrophy className="text-yellow-500" />;
    if (rank === 2) return <FaTrophy className="text-gray-400" />;
    if (rank === 3) return <FaTrophy className="text-amber-600" />;
    return null;
  };

  return (
    <>
      {/* 프린트 전용 CSS */}
      <style jsx>{`
        @media print {
          .print-content {
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 20px !important;
          }
          
          .print-table {
            width: 100% !important;
            max-width: 100% !important;
            table-layout: fixed !important;
            font-size: 11px !important;
            border-collapse: collapse !important;
          }
          
          .print-table th,
          .print-table td {
            padding: 4px 2px !important;
            word-wrap: break-word !important;
            overflow-wrap: break-word !important;
            border: 1px solid #000 !important;
            vertical-align: top !important;
          }
          
          .print-table th {
            background-color: #f0f0f0 !important;
            font-weight: bold !important;
            text-align: center !important;
          }
          
          .print-content {
            page-break-inside: avoid !important;
          }
          
          /* 페이지 여백 설정 */
          @page {
            margin: 0.5in !important;
            size: letter !important;
          }
          
          /* 컬럼 너비 고정 */
          .col-rank { width: 8% !important; }
          .col-barcode { width: 15% !important; }
          .col-title { width: 45% !important; }
          .col-author { width: 22% !important; }
          .col-count { width: 10% !important; }
          
          .col-person-id { width: 10% !important; }
          .col-person-name { width: 25% !important; }
          .col-phone { width: 20% !important; }
          .col-email { width: 25% !important; }
          .col-books { width: 10% !important; }
        }
      `}</style>
      
      <div className="print-content p-8 max-w-[8.5in] mx-auto flex flex-col" style={{ width: '8.5in', minHeight: '11in' }}>
        {/* TOP BOOKS/MEMBERS 제목 */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {reportType === 'books' ? 'TOP BOOKS' : 'TOP MEMBERS'}
          </h1>
        </div>

        {/* Period and Date Row */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-lg font-semibold text-gray-700">
            PERIOD: {startDate ? new Date(startDate).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }) : ''} ~ {endDate ? new Date(endDate).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }) : ''}
          </div>
          <div className="text-right font-mono">
            <div>DATE: {new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}</div>
            <div>TIME: {new Date().toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1">
          <table className="print-table w-full border border-gray-300" style={{ tableLayout: 'fixed' }}>
            <thead>
              <tr className="bg-gray-100">
                <th className="col-rank border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-700">순위</th>
                {reportType === 'books' ? (
                  <>
                    <th className="col-barcode border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-700">BARCODE</th>
                    <th className="col-title border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-700">도서명</th>
                    <th className="col-author border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-700">저자</th>
                    <th className="col-count border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-700">빌린 사람 수</th>
                  </>
                ) : (
                  <>
                    <th className="col-person-id border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-700">교인 ID</th>
                    <th className="col-person-name border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-700">교인명</th>
                    <th className="col-phone border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-700">전화번호</th>
                    <th className="col-email border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-700">이메일</th>
                    <th className="col-books border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-700">빌린 책 수</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {reportType === 'books' ? (
                topBooks.map((book, index) => (
                  <tr key={book.bookid} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="col-rank border border-gray-300 px-3 py-2 text-sm text-center">{index + 1}</td>
                    <td className="col-barcode border border-gray-300 px-3 py-2 text-sm font-mono">{book.barcode}</td>
                    <td className="col-title border border-gray-300 px-3 py-2 text-sm font-medium text-gray-900" style={{ wordBreak: 'break-word' }}>{book.book_name}</td>
                    <td className="col-author border border-gray-300 px-3 py-2 text-sm font-medium text-gray-900" style={{ wordBreak: 'break-word' }}>{book.author}</td>
                    <td className="col-count border border-gray-300 px-3 py-2 text-sm font-bold text-blue-600 text-center">{book.persons.toLocaleString()}명</td>
                  </tr>
                ))
              ) : (
                topPeople.map((person, index) => (
                  <tr key={person.person_id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="col-rank border border-gray-300 px-3 py-2 text-sm text-center">{index + 1}</td>
                    <td className="col-person-id border border-gray-300 px-3 py-2 text-sm font-mono">{person.person_id}</td>
                    <td className="col-person-name border border-gray-300 px-3 py-2 text-sm font-medium text-gray-900" style={{ wordBreak: 'break-word' }}>{person.person_name}</td>
                    <td className="col-phone border border-gray-300 px-3 py-2 text-sm font-mono">{person.mobilenum || '-'}</td>
                    <td className="col-email border border-gray-300 px-3 py-2 text-sm" style={{ wordBreak: 'break-word' }}>{person.email || '-'}</td>
                    <td className="col-books border border-gray-300 px-3 py-2 text-sm font-bold text-green-600 text-center">{person.books.toLocaleString()}권</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 페이지 번호 - 항상 바닥글 위치에 표시 */}
        <div className="mt-auto pt-8 text-center text-sm text-gray-600">
          {currentPage} / {totalPages}
        </div>
      </div>
    </>
  );
}
