'use client';

import { FaTrophy, FaPrint } from 'react-icons/fa';

interface TopBook {
  bookid: number;
  barcode: string;
  book_name: string;
  author?: string;
  persons: number;
}

interface TopPerson {
  person_id: number;
  person_name: string;
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
          <div className="print-content p-6 max-w-[8.5in] mx-auto flex flex-col" style={{ width: '8.5in', minHeight: '11in' }}>
                       {/* Header */}
        <div className="mb-6">
                     <div className="flex justify-center items-center relative">
             <h1 className="text-2xl font-bold">TOP BOOKS</h1>
            <button 
              onClick={() => window.print()}
              className="absolute right-0 p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 print:hidden"
              title="Print Report"
            >
              <FaPrint className="w-5 h-5" />
            </button>
          </div>
        </div>
       
                                       {/* Period and Date/Time - Same line */}
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <p className="text-base text-gray-600">
              {startDate && endDate ? `PERIOD : ${formatDate(startDate)} ~ ${formatDate(endDate)}` : ''}
            </p>
            <div className="text-xs text-gray-500 text-right">
              <p>DATE : {new Date().toLocaleDateString('en-US', {
                month: '2-digit',
                day: '2-digit',
                year: 'numeric'
              })}</p>
              <p>TIME : {new Date().toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
              })}</p>
            </div>
          </div>
          {totalPages > 1 && (
            <p className="text-xs text-gray-500 mt-1 text-left">
              페이지: {currentPage} of {totalPages}
            </p>
          )}
        </div>

      

                                                                                                               {/* Data Table */}
          <div className="mb-6 flex-1">
          
                   {reportType === 'books' ? (
             <table className="min-w-full border border-gray-300 text-sm">
               <thead>
                 <tr className="bg-gray-100">
                   <th className="border border-gray-300 px-3 py-2 text-left font-bold">순위</th>
                   <th className="border border-gray-300 px-3 py-2 text-left font-bold">도서명</th>
                   <th className="border border-gray-300 px-3 py-2 text-left font-bold">저자</th>
                   <th className="border border-gray-300 px-3 py-2 text-left font-bold">BARCODE</th>
                   <th className="border border-gray-300 px-3 py-2 text-left font-bold">빌린 사람 수</th>
                 </tr>
               </thead>
               <tbody>
                 {topBooks.map((book, index) => (
                   <tr key={book.bookid} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                     <td className="border border-gray-300 px-3 py-2">
                       <div className="flex items-center space-x-2">
                         <span>{index + 1}</span>
                         {getRankIcon(index + 1)}
                       </div>
                     </td>
                     <td className="border border-gray-300 px-3 py-2">{book.book_name}</td>
                     <td className="border border-gray-300 px-3 py-2">{book.author || '-'}</td>
                     <td className="border border-gray-300 px-3 py-2">{book.barcode}</td>
                     <td className="border border-gray-300 px-3 py-2 font-bold">{book.persons}명</td>
                   </tr>
                 ))}
               </tbody>
             </table>
                                    ) : (
             <table className="min-w-full border border-gray-300 text-sm">
               <thead>
                 <tr className="bg-gray-100">
                   <th className="border border-gray-300 px-3 py-2 text-left font-bold">순위</th>
                   <th className="border border-gray-300 px-3 py-2 text-left font-bold">교인명</th>
                   <th className="border border-gray-300 px-3 py-2 text-left font-bold">빌린 책 수</th>
                 </tr>
               </thead>
               <tbody>
                 {topPeople.map((person, index) => (
                   <tr key={person.person_id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                     <td className="border border-gray-300 px-3 py-2">
                       <div className="flex items-center space-x-2">
                         <span>{index + 1}</span>
                         {getRankIcon(index + 1)}
                       </div>
                     </td>
                     <td className="border border-gray-300 px-3 py-2">{person.person_name}</td>
                     <td className="border border-gray-300 px-3 py-2 font-bold">{person.books}권</td>
                   </tr>
                 ))}
               </tbody>
             </table>
           )}
       </div>

              
        
                                                                {/* Page Number - Fixed at bottom */}
           <div className="text-center text-sm text-gray-500 mt-auto pt-8">
             {currentPage} of {totalPages}
           </div>
    </div>
  );
}
