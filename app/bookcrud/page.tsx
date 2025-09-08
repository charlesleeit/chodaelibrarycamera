'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Book } from '@/lib/models/book';
import { FaEdit, FaTrash, FaTimes, FaSave, FaBook } from 'react-icons/fa';

type SortField = 'barcode' | 'name' | 'author' | 'category' | 'book_type' | 'isbn' | 'publish' | 'publishyear' | 'authorcode' | 'oldcategory';
type SortOrder = 'asc' | 'desc';

export default function Books() {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [categories, setCategories] = useState<{ code: string, description: string }[]>([]);
  const [bookTypes, setBookTypes] = useState<{ code: string, description: string }[]>([]);
  const [formData, setFormData] = useState<Partial<Book>>({
    barcode: '',
    name: '',
    author: '',
    category: '',
    book_type: '',
    oldcategory: '',
    authorcode: '',
    isbn: '',
    publish: '',
    publishyear: '',
    status: 1
  });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(50);
  const [showForm, setShowForm] = useState<boolean>(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // 검색 필드에 기본 포커스 설정
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  const filterAndSortBooks = useCallback(() => {
    if (!Array.isArray(books)) {
      setFilteredBooks([]);
      return;
    }

    let result = [...books];

    // Apply search filter
    if (searchTerm) {
      console.log('Searching for:', searchTerm);
      result = result.filter(book => {
        const barcodeMatch = (book.barcode?.toLowerCase() || '').includes(searchTerm.toLowerCase());
        const nameMatch = (book.name?.toLowerCase() || '').includes(searchTerm.toLowerCase());
        const authorMatch = (book.author?.toLowerCase() || '').includes(searchTerm.toLowerCase());
        const isbnMatch = (book.isbn?.toLowerCase() || '').includes(searchTerm.toLowerCase());
        
        console.log(`Book ${book.id}: barcode="${book.barcode}", barcodeMatch=${barcodeMatch}, nameMatch=${nameMatch}, authorMatch=${authorMatch}, isbnMatch=${isbnMatch}`);
        
        return barcodeMatch || nameMatch || authorMatch || isbnMatch;
      });
      console.log('Filtered results count:', result.length);
    }

    // Apply sorting
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
  }, [books, searchTerm, sortField, sortOrder, filterAndSortBooks]);

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

  const fetchBooks = useCallback(async () => {
    try {
      const response = await fetch('/api/bookcrud');
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched books data:', data);
        
        // status 값 검증 및 수정
        const validatedBooks = data.map((book: any) => {
          let status = book.status;
          
          // NaN 체크 및 수정
          if (isNaN(status) || status === null || status === undefined) {
            console.log(`Book ${book.id} has invalid status: ${book.status}, correcting to 1`);
            status = 1;
          }
          
          // boolean을 숫자로 변환
          if (typeof status === 'boolean') {
            status = status ? 1 : 0;
            console.log(`Book ${book.id} boolean status converted: ${book.status} -> ${status}`);
          }
          
          // 문자열을 숫자로 변환
          if (typeof status === 'string') {
            if (status.toLowerCase() === 'true') {
              status = 1;
            } else if (status.toLowerCase() === 'false') {
              status = 0;
            } else {
              status = parseInt(status, 10) || 1;
            }
            console.log(`Book ${book.id} string status converted: ${book.status} -> ${status}`);
          }
          
          return {
            ...book,
            status: status
          };
        });
        
        setBooks(validatedBooks);
        
        // 첫 번째 책의 status 확인
        if (validatedBooks.length > 0) {
          const firstBook = validatedBooks[0];
          console.log('First book status check (after validation):', {
            id: firstBook.id,
            name: firstBook.name,
            status: firstBook.status,
            statusType: typeof firstBook.status,
            statusValue: JSON.stringify(firstBook.status)
          });
        }
      } else {
        console.error('Failed to fetch books');
      }
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  }, []);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    
    if (name === 'status') {
      const checked = (e.target as HTMLInputElement).checked;
      const newValue = checked ? 1 : 0;
      console.log(`=== STATUS CHECKBOX CHANGE ===`);
      console.log(`Event target:`, e.target);
      console.log(`Checkbox checked: ${checked}`);
      console.log(`New status value: ${newValue}`);
      console.log(`Previous formData.status: ${formData.status}`);
      
      setFormData(prev => {
        const updated = {
          ...prev,
          [name]: newValue
        };
        console.log(`Updated form data status: ${updated.status}`);
        console.log(`Form data after update:`, updated);
        return updated;
      });
      return;
    }
    
    const newValue = value;
    console.log(`Changing ${name} to:`, newValue);
    setFormData(prev => {
      const updated = {
        ...prev,
        [name]: newValue
      };
      console.log('Updated form data:', updated);
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    console.log('=== FORM SUBMISSION START ===');
    console.log('Form submission - formData:', formData);
    console.log('Form submission - status value:', formData.status, 'type:', typeof formData.status);
    console.log('Form submission - status boolean check:', formData.status === 1 ? 'TRUE' : 'FALSE');
    console.log('Form submission - book_type value:', formData.book_type);
    
    // 체크박스 상태 확인
    const statusCheckbox = document.querySelector('input[name="status"]') as HTMLInputElement;
    if (statusCheckbox) {
      console.log('Checkbox actual state:', {
        checked: statusCheckbox.checked,
        value: statusCheckbox.value,
        formDataStatus: formData.status
      });
    }
    
    try {
      const url = selectedBook 
        ? `/api/bookcrud/${selectedBook.id}`
        : '/api/bookcrud';
      
      console.log('Sending request to:', url);
      console.log('Request body:', JSON.stringify(formData, null, 2));
      
      const response = await fetch(url, {
        method: selectedBook ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        throw new Error('Failed to save book');
      }

      const responseData = await response.json();
      console.log('Response data:', responseData);

      await fetchBooks();
      setSelectedBook(null);
      setFormData({
        barcode: '',
        name: '',
        author: '',
        category: '',
        book_type: '',
        oldcategory: '',
        authorcode: '',
        isbn: '',
        publish: '',
        publishyear: '',
        status: 1
      });
      setShowForm(false);
    } catch (error: any) {
      console.error('Submit error:', error);
      setError(error.message || 'Failed to save book');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this book?')) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/bookcrud/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete book');
      }

      await fetchBooks();
    } catch (error: any) {
      setError(error.message || 'Failed to delete book');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (book: Book) => {
    console.log('=== EDIT BOOK START ===');
    console.log('Editing book with original data:', book);
    console.log('Original book status:', book.status, 'type:', typeof book.status, 'value:', JSON.stringify(book.status));
    
    // status 값 검증 및 수정
    let status = book.status;
    if (status === null || status === undefined) {
      status = 1; // 기본값
      console.log(`Status corrected from "${book.status}" to ${status}`);
    } else {
      status = parseInt(status.toString(), 10); // 숫자로 확실하게 변환
      console.log(`Status converted to: ${status}`);
    }
    
    // Ensure category is a string and trim it
    const formattedBook = {
      ...book,
      category: book.category?.toString().trim() || '',
      status: status  // 검증된 status 값 사용
    };
    
    console.log('Formatted book status:', formattedBook.status, 'type:', typeof formattedBook.status, 'value:', JSON.stringify(formattedBook.status));
    
    // Find matching category from our categories list
    const matchingCategory = categories.find(cat => cat.code.trim() === formattedBook.category.trim());
    if (matchingCategory) {
      console.log('Found matching category:', matchingCategory);
      formattedBook.category = matchingCategory.code; // Use the exact code from our categories list
    } else {
      console.log('No matching category found for:', formattedBook.category);
    }
    
    console.log('Final formatted book data:', formattedBook);
    setSelectedBook(formattedBook);
    setFormData(formattedBook);
    setShowForm(true);
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredBooks.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl font-bold text-gray-800">BOOK LIST</h1>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="text-blue-600 hover:text-blue-900 transition-colors duration-200 p-2 rounded-lg hover:bg-blue-50"
            title="Add Book"
          >
            <div className="relative">
              <FaBook className="text-xl" />
              <span className="absolute -top-1 -right-1 text-xs bg-blue-600 text-white rounded-full w-4 h-4 flex items-center justify-center">+</span>
            </div>
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {selectedBook ? 'Edit Book' : 'Add New Book'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Barcode</label>
                <input
                  type="text"
                  name="barcode"
                  value={formData.barcode}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Author</label>
                <input
                  type="text"
                  name="author"
                  value={formData.author}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select
                  name="category"
                  value={formData.category?.toString().trim() || ''}
                  onChange={(e) => {
                    console.log('Category selection:', {
                      selectedValue: e.target.value,
                      currentFormData: formData.category,
                      availableCategories: categories.map(c => ({code: c.code, description: c.description}))
                    });
                    handleInputChange(e);
                  }}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => {
                    const categoryCode = cat.code.trim();
                    const currentCategory = formData.category?.toString().trim() || '';
                    console.log('Rendering category option:', {
                      code: categoryCode,
                      currentValue: currentCategory,
                      isSelected: categoryCode === currentCategory
                    });
                    return (
                      <option 
                        key={categoryCode} 
                        value={categoryCode}
                      >
                        {categoryCode} {cat.description}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Sub Category</label>
                <input
                  type="text"
                  name="oldcategory"
                  value={formData.oldcategory}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Book Type</label>
                <select
                  name="book_type"
                  value={formData.book_type?.toString().trim() || ''}
                  onChange={(e) => {
                    console.log('Book Type selection changed:', {
                      selectedValue: e.target.value,
                      selectedOption: e.target.options[e.target.selectedIndex]?.text,
                      currentFormData: formData.book_type
                    });
                    handleInputChange(e);
                  }}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Select Book Type</option>
                  {bookTypes.map(type => (
                    <option 
                      key={type.code} 
                      value={type.code}
                    >
                      {type.code} - {type.description}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Author Code</label>
                <input
                  type="text"
                  name="authorcode"
                  value={formData.authorcode}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">ISBN</label>
                <input
                  type="text"
                  name="isbn"
                  value={formData.isbn}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Publish</label>
                <input
                  type="text"
                  name="publish"
                  value={formData.publish}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Publish Year</label>
                <input
                  type="text"
                  name="publishyear"
                  value={formData.publishyear}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="status"
                checked={formData.status === 1}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                Active
              </label>
            </div>
            <div className="flex justify-end space-x-2">
              {selectedBook && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedBook(null);
                    setFormData({
                      barcode: '',
                      name: '',
                      author: '',
                      category: '',
                      book_type: '',
                      oldcategory: '',
                      authorcode: '',
                      isbn: '',
                      publish: '',
                      publishyear: '',
                      status: 0
                    });
                  }}
                  className="text-gray-600 hover:text-gray-900 transition-colors duration-200 p-2 rounded-lg hover:bg-gray-50"
                  title="Cancel"
                >
                  <FaTimes className="text-xl" />
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className="text-blue-600 hover:text-blue-900 transition-colors duration-200 p-2 rounded-lg hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                title={loading ? 'Saving...' : selectedBook ? 'Update' : 'Save'}
              >
                <FaSave className="text-xl" />
              </button>
            </div>
          </form>
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
                    className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider cursor-pointer hover:bg-gray-500"
                    onClick={() => handleSort('name')}
                  >
                    Name {sortField === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider cursor-pointer hover:bg-gray-500"
                    onClick={() => handleSort('author')}
                  >
                    Author {sortField === 'author' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider cursor-pointer hover:bg-gray-500"
                    onClick={() => handleSort('barcode')}
                  >
                    Barcode {sortField === 'barcode' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider cursor-pointer hover:bg-gray-500"
                    onClick={() => handleSort('category')}
                  >
                    Category {sortField === 'category' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider cursor-pointer hover:bg-gray-500"
                    onClick={() => handleSort('oldcategory')}
                  >
                    Sub Category {sortField === 'oldcategory' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider cursor-pointer hover:bg-gray-500"
                    onClick={() => handleSort('book_type')}
                  >
                    Book Type {sortField === 'book_type' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider cursor-pointer hover:bg-gray-500"
                    onClick={() => handleSort('authorcode')}
                  >
                    Author Code {sortField === 'authorcode' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider cursor-pointer hover:bg-gray-500"
                    onClick={() => handleSort('isbn')}
                  >
                    ISBN {sortField === 'isbn' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider cursor-pointer hover:bg-gray-500"
                    onClick={() => handleSort('publish')}
                  >
                    Publish {sortField === 'publish' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider cursor-pointer hover:bg-gray-500"
                    onClick={() => handleSort('publishyear')}
                  >
                    Year {sortField === 'publishyear' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">Status</th>
                  <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">Actions</th>
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
                      <div className={`max-w-[200px] truncate ${book.status === 0 ? 'text-gray-400' : ''}`} title={`${book.category} - ${categories.find(cat => cat.code === book.category)?.description || ''}`}>
                        {book.category} - {categories.find(cat => cat.code === book.category)?.description || ''}
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
                        <span className="text-gray-400">{book.isbn}</span>
                      ) : (
                        book.isbn
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
                      <div>
                        {book.status === 1 ? (
                          <span className="text-green-600">Active</span>
                        ) : (
                          <span className="text-red-600">InActive</span>
                        )}
                      </div>
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-sm">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(book)}
                          className="text-blue-600 hover:text-blue-900 transition-colors duration-200 p-2 rounded-lg hover:bg-blue-50"
                          title="Edit"
                        >
                          <FaEdit className="text-xl" />
                        </button>
                        <button
                          onClick={() => handleDelete(book.id)}
                          className="text-red-600 hover:text-red-900 transition-colors duration-200 p-2 rounded-lg hover:bg-red-50"
                          title="Delete"
                        >
                          <FaTrash className="text-xl" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(indexOfLastItem, filteredBooks.length)}
                    </span>{' '}
                    of <span className="font-medium">{filteredBooks.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    {Array.from(
                      { length: Math.min(10, totalPages - Math.floor((currentPage - 1) / 10) * 10) },
                      (_, i) => Math.floor((currentPage - 1) / 10) * 10 + i + 1
                    ).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === page
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
} 