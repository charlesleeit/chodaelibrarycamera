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
        <table className="min-w-full border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-700">순위</th>
              {reportType === 'books' ? (
                <>
                  <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-700">BARCODE</th>
                  <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-700">도서명</th>
                  <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-700">저자</th>
                  <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-700">빌린 사람 수</th>
                </>
              ) : (
                <>
                  <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-700">교인 ID</th>
                  <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-700">교인명</th>
                  <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-700">전화번호</th>
                  <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-700">이메일</th>
                  <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-700">빌린 책 수</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {reportType === 'books' ? (
              topBooks.map((book, index) => (
                <tr key={book.bookid} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border border-gray-300 px-3 py-2 text-sm">{index + 1}</td>
                  <td className="border border-gray-300 px-3 py-2 text-sm font-mono">{book.barcode}</td>
                  <td className="border border-gray-300 px-3 py-2 text-sm font-medium text-gray-900">{book.book_name}</td>
                  <td className="border border-gray-300 px-3 py-2 text-sm font-medium text-gray-900">{book.author}</td>
                  <td className="border border-gray-300 px-3 py-2 text-sm font-bold text-blue-600">{book.persons.toLocaleString()}명</td>
                </tr>
              ))
            ) : (
              topPeople.map((person, index) => (
                <tr key={person.person_id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border border-gray-300 px-3 py-2 text-sm">{index + 1}</td>
                  <td className="border border-gray-300 px-3 py-2 text-sm font-mono">{person.person_id}</td>
                  <td className="border border-gray-300 px-3 py-2 text-sm font-medium text-gray-900">{person.person_name}</td>
                  <td className="border border-gray-300 px-3 py-2 text-sm font-mono">{person.mobilenum || '-'}</td>
                  <td className="border border-gray-300 px-3 py-2 text-sm max-w-[250px] truncate" title={person.email}>{person.email || '-'}</td>
                  <td className="border border-gray-300 px-3 py-2 text-sm font-bold text-green-600">{person.books.toLocaleString()}권</td>
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
  );
}
