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
    const res = await fetch(`/api/bookcrud/scan?barcode=${encodeURIComponent(barcode)}`);
    const data = await res.json();
    if (data.success && data.book) {
      return { 
        barcode: data.book.barcode, 
        name: data.book.name, 
        num: data.book.num 
      };
    }
    return null;
  };

  const handleBookReturn = async () => {
    if (!returnBookId.trim()) return;

    setLoadingReturn(true);
    setReturnError('');
    setBookInfo(null);
    setReturnSuccess(false);

    try {
      const book = await fetchBookInfo(returnBookId);
      if (book) {
        setBookInfo(book);
        
        const returnRes = await fetch('/api/takeout/return', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ barcode: returnBookId })
        });
        
        const returnData = await returnRes.json();
        if (returnData.success) {
          setReturnSuccess(true);
          setReturnBookId('');
          setTimeout(() => {
            setBookInfo(null);
            setReturnSuccess(false);
          }, 3000);
        } else {
          setReturnError(returnData.error || '반납 처리 중 오류가 발생했습니다.');
        }
      } else {
        setReturnError('도서 정보를 찾을 수 없습니다.');
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
    <div className="w-full flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Book Return</h1>
        
        <div className="space-y-4">
          {/* 바코드 입력 필드 */}
          <div>
            <label htmlFor="book-return" className="block text-sm font-semibold text-gray-700 mb-2">
              Book Barcode
            </label>
            <input
              type="text"
              id="book-return"
              value={returnBookId}
              onChange={e => setReturnBookId(e.target.value)}
              className={`w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg ${
                loadingReturn ? 'opacity-60' : ''
              }`}
              placeholder="Enter Book Barcode to return"
              onKeyDown={e => { if (e.key === 'Enter') handleBookReturn(); }}
              ref={bookReturnInputRef}
              disabled={loadingReturn}
            />
          </div>

          {/* 반납 버튼 */}
          <button
            type="button"
            className={`w-full flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors font-medium text-lg ${
              loadingReturn ? 'opacity-60 cursor-not-allowed' : ''
            }`}
            onClick={handleBookReturn}
            disabled={loadingReturn}
          >
            {loadingReturn ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
                Processing...
              </>
            ) : (
              'Return Book'
            )}
          </button>

          {/* Book Info/Result Box */}
          {(bookInfo || returnError) && (
            <div className={`mt-4 p-4 rounded shadow-sm border ${
              returnSuccess ? 'bg-green-50 border-green-200 text-green-900' : 'bg-red-50 border-red-200 text-red-900'
            }`}>
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