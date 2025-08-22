'use client';

import { useState, useEffect, useRef } from 'react';
import { FaUser, FaPhone } from 'react-icons/fa';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

interface OutInRecord {
  id: string;
  date: string;
  line: number;
  bookid: string;
  barcode: string;
  closedate: string | null;
  bookname: string;
}

export default function TakeoutPage() {
  const [id, setId] = useState('');
  const [phoneNo, setPhoneNo] = useState('');
  const [records, setRecords] = useState<OutInRecord[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<{ id: string, name: string, mobilenum?: string } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const pagedRecords = records.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.max(1, Math.ceil(records.length / itemsPerPage));
  const [bookId, setBookId] = useState('');
  const [scanError, setScanError] = useState('');
  const [bookModal, setBookModal] = useState<{ id: string, barcode: string, name: string, num: string } | null>(null);
  const bookScanInputRef = useRef<HTMLInputElement>(null);
  const memberIdInputRef = useRef<HTMLInputElement>(null);
  const currentUserIdRef = useRef<string>('');
  const [showConfirmation, setShowConfirmation] = useState(true);
  const [lastAddedBarcode, setLastAddedBarcode] = useState<string | null>(null);
  const [loadingScan, setLoadingScan] = useState(false);

  // Member ID 입력 필드에 기본 포커스 설정
  useEffect(() => {
    if (showConfirmation && memberIdInputRef.current) {
      memberIdInputRef.current.focus();
    }
  }, [showConfirmation]);

  // Book ID 입력 필드에 기본 포커스 설정
  useEffect(() => {
    if (!showConfirmation && bookScanInputRef.current) {
      bookScanInputRef.current.focus();
    }
  }, [showConfirmation]);

  // localStorage에서 ID 복원
  useEffect(() => {
    const storedId = localStorage.getItem('currentUserId');
    if (storedId && (!id || id.trim() === '')) {
      console.log('Restoring ID from localStorage:', storedId);
      setId(storedId);
    }
  }, [id]);

  // Fetch person info if id changes (manual input) - 임시 비활성화
  /*
  useEffect(() => {
    if (!id) {
      setSelectedPerson(null);
      return;
    }
    fetch('/api/people/list')
      .then(res => res.json())
      .then(data => {
        console.log('API response data:', data);
        // data가 배열인지 확인
        if (Array.isArray(data)) {
          const found = data.find((p: any) => String(p.id) === String(id));
          if (found) setSelectedPerson(found);
          else setSelectedPerson(null);
        } else {
          console.error('API response is not an array:', data);
          setSelectedPerson(null);
        }
      })
      .catch(error => {
        console.error('Error fetching people list:', error);
        setSelectedPerson(null);
      });
  }, [id]);
  */

  const handleConfirmation = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    console.log('handleConfirmation called with id:', id, 'phoneNo:', phoneNo);

    try {
      const response = await fetch(`/api/people/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, phoneNo }),
      });
      const data = await response.json();
      
      console.log('API response:', data);
      
      if (data.success) {
        console.log('Authentication successful, setting showConfirmation to false, id:', id);
        setShowConfirmation(false);
        // id 상태가 제대로 유지되도록 명시적으로 설정
        setId(id);
        // localStorage에 ID 저장
        localStorage.setItem('currentUserId', id);
        // useRef에도 ID 저장
        currentUserIdRef.current = id;
        console.log('After setId, id state is:', id);
        console.log('Saved to localStorage:', id);
        console.log('Saved to currentUserIdRef:', currentUserIdRef.current);
        handleSearch();
      } else {
        setError(data.message || 'Invalid member ID or phone number');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while verifying');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`/api/takeout/search?id=${encodeURIComponent(id)}`);
      const data = await response.json();
      
      if (data.success) {
        setRecords(data.records);
      } else {
        setError(data.message || 'Failed to fetch records');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while searching');
    } finally {
      setLoading(false);
    }
  };

  const handleSmartSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (id.trim()) {
      handleSearch(e ?? { preventDefault: () => {} } as React.FormEvent);
    } else {
      // setModalOpen(true);
    }
  };

  const handleBookScan = async () => {
    setScanError('');
    console.log('=== handleBookScan Debug ===');
    console.log('Current id state:', id);
    console.log('Current bookId state:', bookId);
    console.log('Current currentUserIdRef.current:', currentUserIdRef.current);
    
    // User Info 섹션에서 실제 표시된 ID 값을 직접 읽어오기
    let currentId = id;
    if (!currentId || currentId.trim() === '') {
      console.log('ID is empty, reading ID directly from User Info section');
      
      // User Info 섹션을 찾기
      const userInfoSection = document.querySelector('.bg-blue-50');
      if (userInfoSection) {
        // Member ID 텍스트를 찾기 (첫 번째 .text-gray-800 요소)
        const idElements = userInfoSection.querySelectorAll('.text-gray-800');
        if (idElements.length > 0) {
          const idText = idElements[0].textContent;
          if (idText && idText !== 'Not verified') {
            currentId = idText.trim();
            console.log('Found ID from User Info section:', currentId);
          }
        }
      }
      
      // 여전히 ID를 찾지 못했다면 useRef에서 가져오기
      if (!currentId || currentId.trim() === '') {
        if (currentUserIdRef.current && currentUserIdRef.current.trim() !== '') {
          currentId = currentUserIdRef.current;
          console.log('Using ID from currentUserIdRef:', currentId);
        } else {
          console.log('No valid ID found anywhere');
        }
      }
    }
    
    console.log('Final currentId:', currentId);
    console.log('Final bookId:', bookId);
    
    if (!currentId || !bookId) {
      console.log('Validation failed:', { 
        currentId: currentId, 
        bookId: bookId, 
        currentIdTruthy: !!currentId, 
        bookIdTruthy: !!bookId 
      });
      setScanError('User ID와 Book BarCode를 모두 입력하세요. 178');
      return;
    }
    
    console.log('Validation passed, proceeding with book scan...');
    console.log('Using ID:', currentId, 'Book ID:', bookId);
    
    // 이미 대출 중인지 프론트에서 검사
    const alreadyTaken = records.some(
      r => (r.barcode === bookId || r.bookid === bookId) && (!r.closedate || r.closedate === '' || r.closedate === null)
    );
    if (alreadyTaken) {
      setScanError('이미 take out한 책입니다.');
      setBookModal(null);
      return;
    }
    setLoadingScan(true);
    try {
      const response = await fetch(`/api/bookcrud/scan?barcode=${encodeURIComponent(bookId)}`);
      const data = await response.json();
      if (!data.success) {
        setScanError(data.message || '책을 찾을 수 없습니다.');
        setBookModal(null);
      } else {
        setBookModal(data.book);
        // 책 정보가 조회되면 bookId는 유지 (Add 버튼에서 사용하기 위해)
        // setBookId(''); // 이 줄을 주석 처리
        console.log('Book found, keeping bookId for Add button:', bookId);
        // 포커스를 다시 텍스트박스로 이동
        if (bookScanInputRef.current) bookScanInputRef.current.focus();
      }
    } catch (err) {
      console.error(err);
      setScanError('서버 오류');
    } finally {
      setLoadingScan(false);
    }
  };

  const handleBookAdd = async () => {
    setScanError('');

    console.log('=== handleBookAdd Debug ===');
    console.log('Current id state:', id);
    console.log('Current bookId state:', bookId);
    console.log('Current currentUserIdRef.current:', currentUserIdRef.current);
    
    // User Info 섹션에서 실제 표시된 ID 값을 직접 읽어오기
    let currentId = id;
    if (!currentId || currentId.trim() === '') {
      console.log('ID is empty in handleBookAdd, reading ID directly from User Info section');
      
      // User Info 섹션을 찾기
      const userInfoSection = document.querySelector('.bg-blue-50');
      if (userInfoSection) {
        // Member ID 텍스트를 찾기 (첫 번째 .text-gray-800 요소)
        const idElements = userInfoSection.querySelectorAll('.text-gray-800');
        if (idElements.length > 0) {
          const idText = idElements[0].textContent;
          if (idText && idText !== 'Not verified') {
            currentId = idText.trim();
            console.log('Found ID from User Info section in handleBookAdd:', currentId);
          }
        }
      }
      
      // 여전히 ID를 찾지 못했다면 useRef에서 가져오기
      if (!currentId || currentId.trim() === '') {
        if (currentUserIdRef.current && currentUserIdRef.current.trim() !== '') {
          currentId = currentUserIdRef.current;
          console.log('Using ID from currentUserIdRef in handleBookAdd:', currentId);
        } else {
          console.log('No valid ID found anywhere in handleBookAdd');
        }
      }
    }
    
    console.log('Final currentId in handleBookAdd:', currentId);
    console.log('Final bookId in handleBookAdd:', bookId);
    
    if (!currentId || !bookId) {
      console.log('Validation failed in handleBookAdd:', { 
        currentId: currentId, 
        bookId: bookId, 
        currentIdTruthy: !!currentId, 
        bookIdTruthy: !!bookId 
      });
      setScanError('User ID와 Book BarCode를 모두 입력하세요. 260');
      return;
    }
    
    console.log('Validation passed in handleBookAdd, proceeding with book add...');
    console.log('Using ID:', currentId, 'Book ID:', bookId);
    
    // 이미 대출 중인지 프론트에서 검사
    const alreadyTaken = records.some(
      r => (r.barcode === bookId || r.bookid === bookId) && (!r.closedate || r.closedate === '' || r.closedate === null)
    );
    if (alreadyTaken) {
      setScanError('이미 take out한 책입니다.');
      return;
    }
    try {
      const response = await fetch('/api/takeout/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: currentId, bookId })
      });
      const data = await response.json();
      if (!data.success) {
        setScanError(data.message || '처리 실패');
      } else {
        // 성공적으로 책을 추가한 후에만 bookId를 지움
        setBookId('');
        setBookModal(null);
        setLastAddedBarcode(bookId);
        handleSearch(undefined);
        if (bookScanInputRef.current) bookScanInputRef.current.focus();
      }
    } catch (err) {
      console.error(err);
      setScanError('서버 오류');
    }
  };

  // 오늘 날짜 구하기 (YYYY-MM-DD)
  const todayStr = new Date().toLocaleDateString('en-CA');

  useEffect(() => {
    if (scanError) {
      window.alert(scanError);
      setScanError('');
    }
  }, [scanError]);

  if (showConfirmation) {
    return (
      <div className="mx-auto p-4" style={{ maxWidth: '144rem' }}>
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Member Verification</h1>
          
          <form onSubmit={handleConfirmation} className="space-y-4">
            <div>
              <label htmlFor="id" className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
                <FaUser className="text-blue-500 text-base" />
                <span className="tracking-wide">Member ID</span>
              </label>
              <input
                type="text"
                id="id"
                value={id}
                onChange={(e) => {
                  // Remove any non-digit characters
                  const numbersOnly = e.target.value.replace(/\D/g, '');
                  setId(numbersOnly);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter Member ID (numbers only)"
                required
                pattern="[0-9]*"
                inputMode="numeric"
                ref={memberIdInputRef}
              />
            </div>

            <div>
              <label htmlFor="phoneNo" className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
                <FaPhone className="text-blue-500 text-base" />
                <span className="tracking-wide">Phone Number</span>
              </label>
              <input
                type="tel"
                id="phoneNo"
                value={phoneNo}
                onChange={(e) => {
                  // Remove any non-digit characters
                  const numbersOnly = e.target.value.replace(/\D/g, '');
                  setPhoneNo(numbersOnly);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter Phone Number (numbers only)"
                required
                pattern="[0-9]*"
                inputMode="numeric"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Verifying...' : 'Confirm'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto p-4" style={{ maxWidth: '144rem' }}>
      <div className="mb-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Take Out Records</h1>
            
            <form onSubmit={handleSmartSearch} className="flex gap-0 items-end justify-between mb-0 pb-0">
              {/* Book Scan Field */}
              <div className="flex flex-col gap-2 flex-1">
                <label htmlFor="book-scan" className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
                  <span className="tracking-wide">Book ID (Scan)</span>
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    id="book-scan"
                    value={bookId}
                    onChange={e => setBookId(e.target.value)}
                    className={`px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500${loadingScan ? ' opacity-60' : ''}`}
                    placeholder="Scan or enter Book ID"
                    onKeyDown={e => { if (e.key === 'Enter') handleBookScan(); }}
                    ref={bookScanInputRef}
                    disabled={loadingScan}
                  />
                  <button
                    type="button"
                    className={`flex items-center justify-center w-16 h-10 bg-green-600 text-white rounded-full hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors font-bold text-base${loadingScan ? ' opacity-60 cursor-not-allowed' : ''}`}
                    title="Book Scan Action"
                    onClick={handleBookScan}
                    disabled={loadingScan}
                  >
                    {loadingScan ? (
                      <svg className="animate-spin h-5 w-5 mr-1 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-25" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                    ) : 'Scan'}
                  </button>
                </div>
                {scanError && <div className="text-xs text-red-500 mt-1">{scanError}</div>}
                {/* Expandable book info section below scan field */}
                {bookModal && (
                  <div className={`mt-0 pt-0 p-2 rounded bg-green-50 border border-green-200 text-green-900 shadow-sm relative max-w-4xl w-full h-[88px]${loadingScan ? ' opacity-60' : ''}`}>
                    <div className="flex justify-between items-center mb-1">
                      <div className="font-bold">Book Id : {bookModal.barcode}</div>
                      <div className="flex justify-end gap-4">
                        <button
                          onClick={handleBookAdd}
                          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold"
                        >Add</button>
                        <button
                          onClick={() => setBookModal(null)}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 font-semibold"
                        >Cancel</button>
                      </div>
                    </div>
                    <div className="mb-0.5 font-bold">Name : {bookModal.name} {bookModal.num}</div>
                  </div>
                )}
              </div>
            </form>
          </div>
          
          {/* 현재 사용자 정보 표시 - Scan 텍스트박스와 같은 높이에 맞춤 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 min-w-[250px] ml-6 self-end">
            <h3 className="text-sm font-semibold text-blue-800 mb-2">Current User Info</h3>
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-blue-600 font-medium">Member ID : </span>
                <span className="text-gray-800">{id || 'Not verified'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-blue-600 font-medium">Phone : </span>
                <span className="text-gray-800">{phoneNo || 'Not verified'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="max-h-[600px] overflow-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-600 sticky top-0 z-10">
              <tr>
                <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider max-w-[120px]">ID</th>
                <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider max-w-[120px]">Date</th>
                <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider max-w-[120px]">Book Id</th>
                <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider max-w-[400px]">Book Name</th>
                <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider max-w-[120px]">Return Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pagedRecords.length > 0 ? (
                pagedRecords.map((record, index) => {
                  // 날짜 포맷이 YYYY-MM-DD 또는 MM/DD/YYYY 등일 수 있으니, 둘 다 체크
                  const recordDate = record.date?.replace(/\//g, '-');
                  const isToday = recordDate === todayStr || new Date(record.date).toLocaleDateString('en-CA') === todayStr;
                  const isLastAdded = record.barcode === lastAddedBarcode && isToday;
                  return (
                    <tr
                      key={`${record.id}-${record.line}-${index}`}
                      className={
                        (index % 2 === 0 ? 'bg-white' : 'bg-gray-50') +
                        (isLastAdded ? ' text-lg bg-yellow-100' : '')
                      }
                    >
                      <td className={`px-2 py-2 whitespace-nowrap text-sm text-gray-900 max-w-[120px] truncate${isLastAdded ? ' font-bold' : ''}`}>{record.id}</td>
                      <td className={`px-2 py-2 whitespace-nowrap text-sm text-gray-900 max-w-[120px] truncate${isLastAdded ? ' font-bold' : ''}`}>{record.date}</td>
                      <td className={`px-2 py-2 whitespace-nowrap text-sm text-gray-900 max-w-[120px] truncate${isLastAdded ? ' font-bold' : ''}`}>{record.barcode}</td>
                      <td className={`px-2 py-2 whitespace-nowrap text-sm text-gray-900 max-w-[400px] truncate${isLastAdded ? ' font-bold' : ''}`}>{record.bookname}</td>
                      <td className={`px-2 py-2 whitespace-nowrap text-sm text-gray-900 max-w-[120px] truncate${isLastAdded ? ' font-bold' : ''}`}>{record.closedate}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-2 py-8 text-center text-gray-400">No records found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
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
            <span className="px-2 text-gray-700 font-semibold">{currentPage} / {totalPages}</span>
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
      </div>
    </div>
  );
} 