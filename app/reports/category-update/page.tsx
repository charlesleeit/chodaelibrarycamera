'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaCamera, FaSearch, FaEdit, FaCheck, FaTimes } from 'react-icons/fa';

interface Book {
  id: number;
  barcode: string;
  name: string;
  author: string;
  category: string;
}

interface Category {
  id: string;
  name: string;
  description: string;
}

export default function CategoryUpdatePage() {
  const { isLoggedIn } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [barcode, setBarcode] = useState<string>('');
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [scanning, setScanning] = useState<boolean>(false);
  const [updating, setUpdating] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const barcodeRef = useRef<HTMLInputElement>(null);

  // 카테고리 목록 (실제로는 API에서 가져와야 함)
  const categories: Category[] = [
    { id: '215', name: '215 기독교 윤리', description: 'Christian Ethics' },
    { id: '160', name: '160 언어철학', description: 'Philosophy of Language' },
    { id: '170', name: '170 역사철학', description: 'Philosophy of History' },
    { id: '180', name: '180 동양 철학', description: 'Eastern Philosophy' },
    { id: '190', name: '190 서양 철학', description: 'Western Philosophy' },
    { id: '200', name: '200 종교 일반', description: 'General Religion' },
    { id: '201', name: '201 기독교', description: 'Christianity' },
    { id: '202', name: '202 불교', description: 'Buddhism' },
    { id: '203', name: '203 유교', description: 'Confucianism' },
    { id: '204', name: '204 도가', description: 'Taoism' },
    { id: '205', name: '205 이슬람교', description: 'Islam' },
    { id: '206', name: '206 힌두교', description: 'Hinduism' },
    { id: '207', name: '207 기타 종교', description: 'Other Religions' },
    { id: '208', name: '208 비교 종교학', description: 'Comparative Religion' },
    { id: '209', name: '209 종교 역사', description: 'History of Religion' },
    { id: '210', name: '210 기독교', description: 'Christianity' },
    { id: '211', name: '211 성경', description: 'Bible' },
    { id: '212', name: '212 교리', description: 'Doctrine' },
    { id: '213', name: '213 신학', description: 'Theology' },
    { id: '214', name: '214 교회 역사', description: 'Church History' },
  ];

  // 카메라 스캔 시작 (현재는 테스트용으로만 동작)
  const startScan = () => {
    setScanning(true);
    // 실제 카메라 스캔 기능은 나중에 구현
  };

  // 카메라 스캔 중지
  const stopScan = () => {
    setScanning(false);
  };

  // 바코드 스캔 완료 시 호출
  const handleBarcodeScanned = (scannedBarcode: string) => {
    setBarcode(scannedBarcode);
    stopScan();
    fetchBookInfo(scannedBarcode);
  };

  // 책 정보 조회
  const fetchBookInfo = async (barcodeValue: string) => {
    if (!barcodeValue) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/bookcrud/scan?barcode=${barcodeValue}`);
      const data = await response.json();
      
      if (data.success) {
        setBook(data.book);
      } else {
        setMessage({ type: 'error', text: '책을 찾을 수 없습니다.' });
        setBook(null);
      }
    } catch (error) {
      setMessage({ type: 'error', text: '책 정보를 불러올 수 없습니다.' });
      setBook(null);
    } finally {
      setLoading(false);
    }
  };

  // 카테고리 업데이트
  const updateCategory = async () => {
    if (!book || !selectedCategory) return;
    
    setUpdating(true);
    try {
      const response = await fetch(`/api/bookcrud/${book.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: selectedCategory
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessage({ type: 'success', text: 'Category updated successfully.' });
        setBook(null);
        setBarcode('');
        // setSelectedCategory(''); // 카테고리는 유지
        
        // 바코드 필드에 포커스
        setTimeout(() => {
          if (barcodeRef.current) {
            barcodeRef.current.focus();
          }
        }, 100);
      } else {
        setMessage({ type: 'error', text: 'Category update failed.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Category update error.' });
    } finally {
      setUpdating(false);
    }
  };

  // 메시지 자동 제거
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  if (!isLoggedIn) {
    return <div className="min-h-screen flex items-center justify-center">Login required.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Category Update</h1>
          <p className="text-sm sm:text-base text-gray-600">Scan the barcode to update the category of the book.</p>
        </div>

        {/* 메인 컨텐츠 */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          {/* 입력 폼 */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Information Input</h2>
            
            {/* 카테고리 선택 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category Select
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              >
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name} - {category.description}
                  </option>
                ))}
              </select>
            </div>

            {/* 바코드 입력 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Barcode
              </label>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <input
                  ref={barcodeRef}
                  type="text"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  placeholder="바코드를 입력하거나 스캔하세요"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                />
                <button
                  onClick={startScan}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base whitespace-nowrap"
                >
                  <FaCamera className="inline mr-2" />
                  스캔
                </button>
              </div>
            </div>

            {/* 책 정보 조회 버튼 */}
            <button
              onClick={() => fetchBookInfo(barcode)}
              disabled={!barcode || loading}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              {loading ? (
                <span>Searching...</span>
              ) : (
                <>
                  <FaSearch className="inline mr-2" />
                  Book Information
                </>
              )}
            </button>
          </div>

          {/* 책 정보 및 업데이트 */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Book Info.</h2>
            
            {book ? (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Book Name : </span>
                      <p className="text-gray-900 mt-1 break-words">{book.name}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Author : </span>
                      <p className="text-gray-900 mt-1 break-words">{book.author || '-'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Barcode : </span>
                      <p className="text-gray-900 mt-1 font-mono text-xs sm:text-sm">{book.barcode}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Current Category : </span>
                      <p className="text-gray-900 mt-1 break-words">{book.category || 'Unclassified'}</p>
                    </div>
                  </div>
                </div>

                {selectedCategory && (
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-sm text-gray-700 mb-2">
                      <span className="font-medium">New Category : </span> {categories.find(c => c.id === selectedCategory)?.name}
                    </p>
                    <button
                      onClick={updateCategory}
                      disabled={updating}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm sm:text-base"
                    >
                      {updating ? (
                        <span>Updating...</span>
                      ) : (
                        <>
                          <FaEdit className="inline mr-2" />
                          Category Update
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <FaSearch className="text-3xl sm:text-4xl mx-auto mb-4 text-gray-300" />
                <p className="text-sm sm:text-base">Enter the barcode and click the search button.</p>
              </div>
            )}
          </div>
        </div>

        {/* 카메라 스캔 모달 */}
        {scanning && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Barcode Scan</h3>
              
              <div className="relative mb-4">
                <div className="w-full h-48 sm:h-64 bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center">
                  <div className="text-white text-center">
                    <FaCamera className="text-4xl mx-auto mb-2" />
                    <p>Camera scanning feature</p>
                    <p className="text-sm text-gray-400">(Coming soon)</p>
                  </div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="border-2 border-red-500 w-32 h-24 sm:w-48 sm:h-32 rounded-lg"></div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <button
                  onClick={stopScan}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm sm:text-base"
                >
                  <FaTimes className="inline mr-2" />
                  취소
                </button>
                <button
                  onClick={() => handleBarcodeScanned('1234567890')} // 테스트용 더미 바코드
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm sm:text-base"
                >
                  <FaCheck className="inline mr-2" />
                  Test Scan
                </button>
              </div>
              
              <p className="text-xs sm:text-sm text-gray-600 mt-2 text-center">
                Put the barcode in the red square.
              </p>
            </div>
          </div>
        )}

        {/* 메시지 표시 */}
        {message && (
          <div className={`fixed top-4 left-4 right-4 sm:left-auto sm:right-4 p-3 sm:p-4 rounded-lg shadow-lg z-50 text-sm sm:text-base ${
            message.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}>
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
}
