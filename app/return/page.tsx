'use client';

import { useState, useRef, useEffect } from 'react';

interface BookInfo {
  barcode: string;
  name: string;
  num?: string;
}

export default function ReturnPage() {
  const [returnBookId, setReturnBookId] = useState('');
  const [loadingReturn, setLoadingReturn] = useState(false);
  const [returnError, setReturnError] = useState('');
  const [bookInfo, setBookInfo] = useState<BookInfo | null>(null);
  const [returnSuccess, setReturnSuccess] = useState(false);
  const bookReturnInputRef = useRef<HTMLInputElement>(null);

  // Book Return 입력 필드에 기본 포커스 설정
  useEffect(() => {
    if (bookReturnInputRef.current) {
      bookReturnInputRef.current.focus();
    }
  }, []);

  const fetchBookInfo = async (barcode: string) => {
    // Fallback: fetch from API
    const res = await fetch(`/api/bookcrud/scan?barcode=${encodeURIComponent(barcode)}`);
    const data = await res.json();
    if (data.success && data.book) {
      return { barcode: data.book.barcode, name: data.book.name + (data.book.num ? ' ' + data.book.num : '') };
    }
    return null;
  };

  const handleBookReturn = async () => {
    setReturnError('');
    setBookInfo(null);
    setReturnSuccess(false);
    if (!returnBookId) {
      setReturnError('Book BarCode를 입력하세요.');
      return;
    }
    setLoadingReturn(true);
    try {
      // Call API to update closedate (id 없이 처리)
      const response = await fetch('/api/takeout/return', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId: returnBookId })
      });
      const data = await response.json();
      if (!data.success) {
        const info = await fetchBookInfo(returnBookId);
        setBookInfo(info);
        setReturnError(data.message || '반납 처리 실패');
        setReturnSuccess(false);
      } else {
        const info = await fetchBookInfo(returnBookId);
        setBookInfo(info);
        setReturnBookId('');
        setReturnSuccess(true);
        if (bookReturnInputRef.current) bookReturnInputRef.current.focus();
      }
    } catch (_err) {
      setReturnError('서버 오류');
      setBookInfo(null);
      setReturnSuccess(false);
    } finally {
      setLoadingReturn(false);
    }
  };

  return (
    <div className="mx-auto p-4" style={{ maxWidth: '144rem' }}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Book Return</h1>
        <div className="flex flex-col gap-2 flex-1 mt-6">
          <label htmlFor="book-return" className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
            <span className="tracking-wide">Book Return (Barcode)</span>
          </label>
          <div className="flex gap-2 items-center">
            <input
              type="text"
              id="book-return"
              value={returnBookId || ''}
              onChange={e => setReturnBookId(e.target.value)}
              className={`px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500${loadingReturn ? ' opacity-60' : ''}`}
              placeholder="Enter or scan Book Barcode to return"
              onKeyDown={e => { if (e.key === 'Enter') handleBookReturn(); }}
              ref={bookReturnInputRef}
              disabled={loadingReturn}
            />
            <button
              type="button"
              className={`flex items-center justify-center w-16 h-10 bg-red-600 text-white rounded-full hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors font-bold text-base${loadingReturn ? ' opacity-60 cursor-not-allowed' : ''}`}
              title="Book Return Action"
              onClick={handleBookReturn}
              disabled={loadingReturn}
            >
              {loadingReturn ? (
                <svg className="animate-spin h-5 w-5 mr-1 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
              ) : 'Return'}
            </button>
          </div>
          {/* Book Info/Result Box */}
          {(bookInfo || returnError) && (
            <div className={`mt-4 p-4 rounded shadow-sm border ${returnSuccess ? 'bg-green-50 border-green-200 text-green-900' : 'bg-red-50 border-red-200 text-red-900'}`}>
              {bookInfo ? (
                <>
                  <div className="font-bold">Book Barcode: {bookInfo.barcode}</div>
                  <div className="font-bold">Book Name: {bookInfo.name}</div>
                  {returnSuccess && <div className="mt-2 text-lg font-bold text-green-700">RETURN 완료</div>}
                  {!returnSuccess && <div className="mt-2 text-lg font-bold text-red-700">BOOK 정보 없음</div>}
                </>
              ) : (
                <div className="font-bold text-red-700">BOOK 정보 없음</div>
              )}
              {returnError && <div className="text-xs text-red-500 mt-2">{returnError}</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 