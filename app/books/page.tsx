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

// BookInfoModal: Google Books API로 책 정보 fetch 후 모달로 표시
function BookInfoModal({ isbn, open, onClose }: { isbn: string|null, open: boolean, onClose: () => void }) {
  const [book, setBook] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open && isbn) {
      setLoading(true);
      setError('');
      setBook(null);
      fetch(`/api/google-books?isbn=${isbn}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.book) {
            setBook(data.book);
          } else {
            setError(data.message || '책 정보를 찾을 수 없습니다.');
          }
        })
        .catch(() => setError('Google Books API 호출 실패'))
        .finally(() => setLoading(false));
    }
  }, [isbn, open]);

  if (!open) return null;
  return (
    <>
      <style jsx>{`
        .book-modal {
          background: #ffffff !important;
          background-color: #ffffff !important;
        }
        .book-modal > div {
          background: #ffffff !important;
          background-color: #ffffff !important;
        }
        .book-modal * {
          color: #1a1a1a !important;
        }
        .book-modal h1, .book-modal h2, .book-modal h3, .book-modal h4, .book-modal h5, .book-modal h6 {
          color: #1a1a1a !important;
        }
        .book-modal p, .book-modal span, .book-modal div {
          color: #1a1a1a !important;
        }
        .book-modal b, .book-modal strong {
          color: #1a1a1a !important;
        }
        .book-modal .text-gray-600 {
          color: #666 !important;
        }
        .book-modal .text-gray-500 {
          color: #999 !important;
        }
      `}</style>
      <div style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100vw', 
        height: '100vh', 
        background: 'rgba(0,0,0,0.5)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        zIndex: 1000,
        padding: '20px'
      }}>
      <div className="book-modal" style={{ 
        background: '#ffffff',
        backgroundColor: '#ffffff',
        padding: 24, 
        borderRadius: 12, 
        width: '500px', 
        maxWidth: '90vw',
        height: '600px', 
        maxHeight: '90vh',
        overflowY: 'auto', 
        position: 'relative',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '1px solid rgba(0, 0, 0, 0.1)',
        colorScheme: 'light'
      }}>
        <button 
          onClick={onClose} 
          style={{ 
            position: 'absolute', 
            top: 12, 
            right: 12, 
            width: '32px',
            height: '32px',
            fontSize: '16px', 
            fontWeight: 'bold',
            background: '#f8f9fa', 
            border: '2px solid #dee2e6',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#6c757d',
            transition: 'all 0.2s ease',
            zIndex: 10,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#dc3545';
            e.currentTarget.style.borderColor = '#dc3545';
            e.currentTarget.style.color = 'white';
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#f8f9fa';
            e.currentTarget.style.borderColor = '#dee2e6';
            e.currentTarget.style.color = '#6c757d';
            e.currentTarget.style.transform = 'scale(1)';
          }}
          title="닫기"
        >
          ✕
        </button>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#1a1a1a !important' }}>로딩중...</div>
        ) : error ? (
          <div style={{ color: 'red !important', padding: 20 }}>{error}</div>
        ) : book ? (
          <div style={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            color: '#1a1a1a !important',
            background: '#ffffff',
            backgroundColor: '#ffffff'
          }}>
            {/* 책 표지와 기본 정보 */}
            <div style={{ display: 'flex', marginBottom: 16, gap: 16 }}>
              {(book.imageLinks?.thumbnail || book.imageLinks?.small || book.imageLinks?.medium) && (
                <div style={{ flexShrink: 0 }}>
                  <Image
                    src={book.imageLinks.thumbnail || book.imageLinks.small || book.imageLinks.medium}
                    alt={book.title}
                    width={120}
                    height={160}
                    style={{ 
                      width: '120px', 
                      height: '160px', 
                      objectFit: 'cover', 
                      borderRadius: '4px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    onError={(e) => {
                      console.log('Image load error:', e);
                      // 이미지 로드 실패 시 다음 크기 시도
                      const target = e.target as HTMLImageElement;
                      if (book.imageLinks?.small && target.src !== book.imageLinks.small) {
                        target.src = book.imageLinks.small;
                      } else if (book.imageLinks?.medium && target.src !== book.imageLinks.medium) {
                        target.src = book.imageLinks.medium;
                      }
                    }}
                  />
                </div>
              )}
              {!(book.imageLinks?.thumbnail || book.imageLinks?.small || book.imageLinks?.medium) && (
                <div style={{ 
                  flexShrink: 0, 
                  width: '120px', 
                  height: '160px', 
                  backgroundColor: '#f3f4f6', 
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#6b7280',
                  fontSize: '12px',
                  textAlign: 'center',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}>
                  이미지 없음
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2 style={{ 
                  fontWeight: 'bold', 
                  fontSize: 18, 
                  marginBottom: 8, 
                  lineHeight: '1.3',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  color: '#1a1a1a !important',
                  WebkitTextFillColor: '#1a1a1a !important'
                }}>
                  {book.title}
                </h2>
                <div style={{ fontSize: '14px', lineHeight: '1.4', color: '#1a1a1a !important' }}>
                  <div style={{ marginBottom: 3, color: '#1a1a1a !important' }}><b style={{ color: '#1a1a1a !important' }}>저자:</b> <span style={{ color: '#666 !important' }}>{book.authors?.join(', ') || 'Unknown'}</span></div>
                  <div style={{ marginBottom: 3, color: '#1a1a1a !important' }}><b style={{ color: '#1a1a1a !important' }}>출판사:</b> <span style={{ color: '#666 !important' }}>{book.publisher}</span></div>
                  <div style={{ marginBottom: 3, color: '#1a1a1a !important' }}><b style={{ color: '#1a1a1a !important' }}>출판일:</b> <span style={{ color: '#666 !important' }}>{book.publishedDate}</span></div>
                  <div style={{ marginBottom: 3, color: '#1a1a1a !important' }}><b style={{ color: '#1a1a1a !important' }}>ISBN:</b> <span style={{ color: '#666 !important' }}>{book.isbn}</span></div>
                  <div style={{ marginBottom: 3, color: '#1a1a1a !important' }}><b style={{ color: '#1a1a1a !important' }}>페이지:</b> <span style={{ color: '#666 !important' }}>{book.pageCount} pages</span></div>
                  <div style={{ marginBottom: 3, color: '#1a1a1a !important' }}><b style={{ color: '#1a1a1a !important' }}>언어:</b> <span style={{ color: '#666 !important' }}>{book.language}</span></div>
                  {book.categories && book.categories.length > 0 && (
                    <div style={{ marginBottom: 3, color: '#1a1a1a !important' }}><b style={{ color: '#1a1a1a !important' }}>카테고리:</b> <span style={{ color: '#666 !important' }}>{book.categories.join(', ')}</span></div>
                  )}
                  {book.averageRating > 0 && (
                    <div style={{ marginBottom: 3, color: '#1a1a1a !important' }}><b style={{ color: '#1a1a1a !important' }}>평점:</b> <span style={{ color: '#666 !important' }}>⭐ {book.averageRating}/5 ({book.ratingsCount} reviews)</span></div>
                  )}
                </div>
              </div>
            </div>
            
            {/* 설명 */}
            <div style={{ flex: 1, marginBottom: 16 }}>
              <h3 style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 8, color: '#1a1a1a !important' }}>설명</h3>
              <div style={{ 
                fontSize: '14px', 
                lineHeight: '1.5', 
                color: '#666 !important',
                maxHeight: '120px',
                overflowY: 'auto',
                padding: '8px',
                backgroundColor: '#f8f9fa',
                borderRadius: '4px',
                border: '1px solid #e9ecef'
              }}>
                {book.description && book.description !== 'No description available' ? (
                  <span style={{ color: '#666 !important' }}>{book.description}</span>
                ) : (
                  <div style={{ 
                    color: '#999 !important', 
                    fontStyle: 'italic',
                    textAlign: 'center',
                    padding: '20px 0'
                  }}>
                    📚 이 책에 대한 상세한 설명이 Google Books에서 제공되지 않습니다.
                    <br />
                    <small style={{ color: '#999 !important' }}>미리보기나 Google Books 링크를 통해 더 자세한 정보를 확인해보세요.</small>
                  </div>
                )}
              </div>
            </div>
            
            {/* 링크 버튼들 */}
            <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
              {book.previewLink && (
                <a 
                  href={book.previewLink} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={{ 
                    color: '#2563eb !important', 
                    textDecoration: 'none',
                    fontSize: '14px',
                    padding: '8px 16px',
                    border: '1px solid #2563eb',
                    borderRadius: '6px',
                    backgroundColor: '#f0f9ff',
                    transition: 'all 0.2s',
                    flex: 1,
                    textAlign: 'center'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#2563eb';
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = '#f0f9ff';
                    e.currentTarget.style.color = '#2563eb';
                  }}
                >
                  미리보기
                </a>
              )}
              {book.infoLink && (
                <a 
                  href={book.infoLink} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={{ 
                    color: '#059669 !important', 
                    textDecoration: 'none',
                    fontSize: '14px',
                    padding: '8px 16px',
                    border: '1px solid #059669',
                    borderRadius: '6px',
                    backgroundColor: '#f0fdf4',
                    transition: 'all 0.2s',
                    flex: 1,
                    textAlign: 'center'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#059669';
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = '#f0fdf4';
                    e.currentTarget.style.color = '#059669';
                  }}
                >
                  Google Books
                </a>
              )}
            </div>
          </div>
        ) : (
          <div style={{ padding: 20, color: '#1a1a1a !important' }}>책 정보 없음</div>
        )}
      </div>
    </div>
    </>
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

  // Improved pagination logic
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    
    if (totalPages <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      if (currentPage <= 3) {
        // Show 1, 2, 3, 4, 5, ..., last
        pages.push(2, 3, 4, 5);
        if (totalPages > 6) {
          pages.push('...');
        }
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Show 1, ..., last-4, last-3, last-2, last-1, last
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Show 1, ..., current-1, current, current+1, ..., last
        pages.push('...');
        pages.push(currentPage - 1, currentPage, currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
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
                {currentItems.map((book, index) => {
                  // 배경색에 따라 글자색 결정
                  const isEvenRow = index % 2 === 0;
                  const isInactive = book.status === 0;
                  const bgColor = isInactive ? 'bg-gray-100' : (isEvenRow ? 'bg-white' : 'bg-gray-50');
                  const textColor = isInactive ? 'text-gray-500' : (isEvenRow ? 'text-gray-900' : 'text-gray-900');
                  
                  return (
                    <tr key={book.id} className={`${bgColor} ${textColor}`}>
                    <td className="px-2 py-2 text-sm">
                      <div className={`max-w-[200px] truncate ${isInactive ? 'text-gray-400' : textColor}`} title={book.name}>{book.name}</div>
                    </td>
                    <td className="px-2 py-2 text-sm">
                      <div className={`max-w-[150px] truncate ${isInactive ? 'text-gray-400' : textColor}`} title={book.author}>{book.author}</div>
                    </td>
                    <td className="px-2 py-2 text-sm">
                      <div className={`max-w-[120px] truncate ${isInactive ? 'text-gray-400' : textColor}`} title={book.barcode}>{book.barcode}</div>
                    </td>
                    <td className="px-2 py-2 text-sm">
                      <div className={`max-w-[150px] truncate ${isInactive ? 'text-gray-400' : textColor}`} title={book.category ? `${book.category} - ${categories.find(cat => cat.code === book.category)?.description || ''}` : ''}>
                        {book.category ? (
                          <>
                            <span className="font-medium">{book.category}</span>
                            {categories.find(cat => cat.code === book.category)?.description && (
                              <span className={`ml-1 ${isInactive ? 'text-gray-400' : 'text-gray-600'}`}>- {categories.find(cat => cat.code === book.category)?.description}</span>
                            )}
                          </>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-2 py-2 text-sm">
                      <div className={`max-w-[100px] truncate ${isInactive ? 'text-gray-400' : textColor}`} title={book.oldcategory}>{book.oldcategory}</div>
                    </td>
                    <td className="px-2 py-2 text-sm">
                      <div className={`max-w-[150px] truncate ${isInactive ? 'text-gray-400' : textColor}`} title={`${book.book_type} - ${bookTypes.find(type => type.code === book.book_type)?.description || ''}`}>
                        {book.book_type ? (
                          <>
                            <span className="font-medium">{book.book_type}</span>
                            {bookTypes.find(type => type.code === book.book_type)?.description && (
                              <span className={`ml-1 ${isInactive ? 'text-gray-400' : 'text-gray-600'}`}>- {bookTypes.find(type => type.code === book.book_type)?.description}</span>
                            )}
                          </>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-2 py-2 text-sm">
                      <div className={`max-w-[100px] truncate ${isInactive ? 'text-gray-400' : textColor}`} title={book.authorcode}>{book.authorcode}</div>
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
                        <span className={textColor}>{book.publish}</span>
                      )}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-sm">
                      {book.status === 0 ? (
                        <span className="text-gray-400">{book.publishyear}</span>
                      ) : (
                        <span className={textColor}>{book.publishyear}</span>
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
                  );
                })}
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