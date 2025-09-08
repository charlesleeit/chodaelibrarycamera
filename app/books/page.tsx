/**
 * Home Page Component
 * 
 * Main page of the NJCHODAE Library System.
 * Displays a list of books with sorting and searching capabilities.
 * Features:
 * - Book list with pagination
 * - Search functionality
 * - Sorting by various fields
 * - Status indicators for active/inactive books
 * 
 * @component
 */
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Book } from '@/lib/models/book';
import { useAuth } from '../context/AuthContext';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import Image from 'next/image';

type SortField = 'barcode' | 'name' | 'author' | 'category' | 'book_type' | 'isbn' | 'publish' | 'publishyear' | 'authorcode' | 'id' | 'status' | 'oldcategory';
type SortOrder = 'asc' | 'desc';

// BookInfoModal: 외부 API로 책 정보 fetch 후 모달로 표시
function BookInfoModal({ isbn, open, onClose }: { isbn: string|null, open: boolean, onClose: () => void }) {
  const [book, setBook] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open && isbn) {
      setLoading(true);
      setError('');
      setBook(null);
      fetch(`/api/barcode?isbn=${isbn}`)
        .then(res => res.json())
        .then(data => {
          if (data.products && data.products.length > 0) {
            setBook(data.products[0]);
          } else {
            setError('책 정보를 찾을 수 없습니다.');
          }
        })
        .catch(() => setError('API 호출 실패'))
        .finally(() => setLoading(false));
    }
  }, [isbn, open]);

  if (!open) return null;
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: 'white', padding: 24, borderRadius: 8, minWidth: 320, maxWidth: 400, position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 8, right: 8, fontSize: 18, background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center' }}>로딩중...</div>
        ) : error ? (
          <div style={{ color: 'red', padding: 20 }}>{error}</div>
        ) : book ? (
          <div>
            {book.images && book.images[0] && (
              <Image
                src={book.images[0]}
                alt={book.title}
                width={180}
                height={240}
                style={{ width: '100%', maxHeight: 180, objectFit: 'contain', marginBottom: 12 }}
              />
            )}
            <h2 style={{ fontWeight: 'bold', fontSize: 20, marginBottom: 8 }}>{book.title}</h2>
            <div style={{ marginBottom: 4 }}><b>저자:</b> {book.contributors?.find((c:any) => c.role === 'author')?.name}</div>
            <div style={{ marginBottom: 4 }}><b>출판사:</b> {book.manufacturer}</div>
            <div style={{ marginBottom: 4 }}><b>ISBN:</b> {book.barcode_number}</div>
            <div style={{ marginBottom: 4 }}><b>카테고리:</b> {book.category}</div>
            <div style={{ marginBottom: 8 }}><b>설명:</b> {book.description}</div>
            {book.stores && book.stores[0] && (
              <a href={book.stores[0].link} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'underline' }}>구매처 바로가기</a>
            )}
          </div>
        ) : (
          <div style={{ padding: 20 }}>책 정보 없음</div>
        )}
      </div>
    </div>
  );
}

export default function Books() {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<{ code: string, description: string }[]>([]);
  const [bookTypes, setBookTypes] = useState<{ code: string, description: string }[]>([]);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(50);
  const { isLoggedIn } = useAuth();
  const [modalIsbn, setModalIsbn] = useState<string|null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // 검색 필드에 기본 포커스 설정
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  // 카테고리 데이터 가져오기
  useEffect(() => {
    fetch('/api/category')
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to fetch categories');
        }
        return res.json();
      })
      .then(data => {
        console.log('Loaded categories:', data);
        const uniqueCategories = data.reduce((acc: Array<{code: string, description: string}>, cat: {code: string, description: string}) => {
          if (!cat.code || acc.some(c => c.code === cat.code)) {
            console.warn('Skipping invalid or duplicate category:', cat);
            return acc;
          }
          return [...acc, cat];
        }, []);
        console.log('Processed categories:', uniqueCategories);
        setCategories(uniqueCategories);
      })
      .catch(error => {
        console.error('Error loading categories:', error);
        setError('Failed to load categories');
        setCategories([]);
      });
  }, []);

  // Book types 데이터 가져오기
  useEffect(() => {
    fetch('/api/booktype')
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to fetch book types');
        }
        return res.json();
      })
      .then(data => {
        console.log('Loaded book types:', data);
        setBookTypes(data);
      })
      .catch(error => {
        console.error('Error loading book types:', error);
        setError('Failed to load book types');
        setBookTypes([]);
      });
  }, []);

  const filterAndSortBooks = useCallback(() => {
    if (!Array.isArray(books)) {
      setFilteredBooks([]);
      return;
    }

    let result = [...books];

    // Apply search filter
    if (searchTerm) {
      result = result.filter(book =>
        (book.barcode?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (book.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (book.author?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (book.isbn?.toLowerCase() || '').includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting by name as default
    result.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredBooks(result);
    setCurrentPage(1);
  }, [books, searchTerm, sortField, sortOrder]);

  useEffect(() => {
    fetchBooks();
  }, []);

  useEffect(() => {
    filterAndSortBooks();
  }, [filterAndSortBooks]);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/bookcrud');
      const data = await response.json();
      setBooks(data);
    } catch (_err) {
      setError('Failed to fetch books');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredBooks.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);

  // Fancy pagination logic
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        pages.push(1, '...', 3, 4, 5, 6, '...', totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    // Remove duplicates and sort
    return [...new Set(pages)].filter(p => p === '...' || (typeof p === 'number' && p >= 1 && p <= totalPages));
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
        </div>
        {isLoggedIn && (
          <button 
            onClick={() => window.location.href = '/bookcrud'} 
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            title="Manage Books"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        )}
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search books..."
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
                  <th
                    className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('name')}
                  >
                    Name {sortField === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('author')}
                  >
                    Author {sortField === 'author' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('barcode')}
                  >
                    Barcode {sortField === 'barcode' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('category')}
                  >
                    Category {sortField === 'category' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('oldcategory')}
                  >
                    Sub Category {sortField === 'oldcategory' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('book_type')}
                  >
                    Book Type {sortField === 'book_type' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('authorcode')}
                  >
                    Author Code {sortField === 'authorcode' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('isbn')}
                  >
                    ISBN {sortField === 'isbn' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('publish')}
                  >
                    Publish {sortField === 'publish' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('publishyear')}
                  >
                    Year {sortField === 'publishyear' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('status')}
                  >
                    AVAILABLE {sortField === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentItems.map((book, index) => (
                  <tr key={book.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} ${book.status === 0 ? 'bg-gray-100 text-gray-500' : ''}`}>
                    <td className="px-2 py-2 text-sm">
                      <div className={`max-w-[200px] truncate ${book.status === 0 ? 'text-gray-400' : ''}`} title={book.name}>{book.name}</div>
                    </td>
                    <td className="px-2 py-2 text-sm">
                      <div className={`max-w-[150px] truncate ${book.status === 0 ? 'text-gray-400' : ''}`} title={book.author}>{book.author}</div>
                    </td>
                    <td className="px-2 py-2 text-sm">
                      <div className={`max-w-[120px] truncate ${book.status === 0 ? 'text-gray-400' : ''}`} title={book.barcode}>{book.barcode}</div>
                    </td>
                    <td className="px-2 py-2 text-sm">
                      <div className={`max-w-[150px] truncate ${book.status === 0 ? 'text-gray-400' : ''}`} title={book.category ? `${book.category} - ${categories.find(cat => cat.code === book.category)?.description || ''}` : ''}>
                        {book.category ? (
                          <>
                            <span className="font-medium">{book.category}</span>
                            {categories.find(cat => cat.code === book.category)?.description && (
                              <span className="text-gray-600 ml-1">- {categories.find(cat => cat.code === book.category)?.description}</span>
                            )}
                          </>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-2 py-2 text-sm">
                      <div className={`max-w-[100px] truncate ${book.status === 0 ? 'text-gray-400' : ''}`} title={book.oldcategory}>{book.oldcategory}</div>
                    </td>
                    <td className="px-2 py-2 text-sm">
                      <div className={`max-w-[150px] truncate ${book.status === 0 ? 'text-gray-400' : ''}`} title={`${book.book_type} - ${bookTypes.find(type => type.code === book.book_type)?.description || ''}`}>
                        {book.book_type ? (
                          <>
                            <span className="font-medium">{book.book_type}</span>
                            {bookTypes.find(type => type.code === book.book_type)?.description && (
                              <span className="text-gray-600 ml-1">- {bookTypes.find(type => type.code === book.book_type)?.description}</span>
                            )}
                          </>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-2 py-2 text-sm">
                      <div className={`max-w-[100px] truncate ${book.status === 0 ? 'text-gray-400' : ''}`} title={book.authorcode}>{book.authorcode}</div>
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-sm">
                      {book.status === 0 ? (
                        <span className="text-gray-400 cursor-not-allowed">{book.isbn}</span>
                      ) : (
                        <span
                          className="text-blue-700 underline cursor-pointer hover:text-blue-900"
                          title="책 정보 보기"
                          onClick={() => { setModalIsbn(book.isbn); setModalOpen(true); }}
                        >
                          {book.isbn}
                        </span>
                      )}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-sm">
                      {book.status === 0 ? (
                        <span className="text-gray-400">{book.publish}</span>
                      ) : (
                        book.publish
                      )}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-sm">
                      {book.status === 0 ? (
                        <span className="text-gray-400">{book.publishyear}</span>
                      ) : (
                        book.publishyear
                      )}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-sm font-medium">
                      {book.available === 1 ? (
                        <span className="text-green-600">Available</span>
                      ) : (
                        <span className="text-red-600">Borrowed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 flex items-center justify-center border-t border-gray-200">
              <nav className="inline-flex items-center space-x-1" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
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
                        onClick={() => setCurrentPage(Number(page))}
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
                  onClick={() => setCurrentPage(currentPage + 1)}
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
      <BookInfoModal isbn={modalIsbn} open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
} 