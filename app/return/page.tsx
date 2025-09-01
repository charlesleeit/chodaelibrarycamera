'use client';

import { useState, useRef, useEffect } from 'react';
import Quagga from 'quagga';

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
  const [isScanning, setIsScanning] = useState(false);
  const bookReturnInputRef = useRef<HTMLInputElement>(null);
  const scannerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Book Return 입력 필드에 기본 포커스 설정
  useEffect(() => {
    if (bookReturnInputRef.current) {
      bookReturnInputRef.current.focus();
    }
  }, []);

  // 사진 촬영으로 바코드 스캔
  const handleTakePhoto = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Canvas에 이미지 그리기
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        // Quagga로 이미지에서 바코드 스캔
        Quagga.decodeSingle({
          src: canvas.toDataURL(),
          numOfWorkers: 0,
          inputStream: {
            size: 800
          },
          decoder: {
            readers: ["code_128_reader", "ean_reader", "ean_8_reader", "code_39_reader", "code_39_vin_reader", "codabar_reader", "upc_reader", "upc_e_reader", "i2of5_reader"]
          }
        }, (result: any) => {
          if (result && result.codeResult) {
            console.log('Barcode detected from photo:', result);
            const code = result.codeResult.code;
            setReturnBookId(code);
            setReturnError('');
            setBookInfo(null);
            setReturnSuccess(false);
            
            if (bookReturnInputRef.current) {
              bookReturnInputRef.current.focus();
              // 잠시 후 자동으로 Return 처리
              setTimeout(() => {
                handleBookReturn();
              }, 500);
            }
          } else {
            setReturnError('사진에서 바코드를 찾을 수 없습니다. 더 선명한 사진을 찍어주세요.');
          }
        });
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // 사진 촬영 버튼 클릭 핸들러
  const handleTakePhotoClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // 카메라 권한 확인
  const checkCameraPermission = async () => {
    // navigator.mediaDevices 지원 여부 확인
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error('getUserMedia is not supported in this browser');
      setReturnError('이 브라우저는 카메라를 지원하지 않습니다. Chrome, Firefox, Safari 최신 버전을 사용해주세요.');
      return false;
    }

    // HTTPS 체크 (카메라 접근을 위해 필요)
    if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
      console.warn('Camera access requires HTTPS in production');
      setReturnError('카메라 접근을 위해 HTTPS가 필요합니다. 개발 환경에서는 localhost에서만 작동합니다.');
      return false;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: {
          facingMode: 'environment', // 후면 카메라 우선
          width: { min: 640, ideal: 1280 },
          height: { min: 480, ideal: 720 }
        } 
      });
      console.log('Camera permission granted, stream:', stream);
      stream.getTracks().forEach(track => track.stop()); // 스트림 정리
      return true;
    } catch (error) {
      console.error('Camera permission error:', error);
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          setReturnError('카메라 권한이 거부되었습니다. 브라우저 설정에서 카메라를 허용해주세요.');
        } else if (error.name === 'NotFoundError') {
          setReturnError('카메라를 찾을 수 없습니다. 카메라가 연결되어 있는지 확인해주세요.');
        } else if (error.name === 'NotSupportedError') {
          setReturnError('이 브라우저는 카메라를 지원하지 않습니다.');
        } else {
          setReturnError('카메라 오류: ' + error.message);
        }
      } else {
        setReturnError('알 수 없는 카메라 오류가 발생했습니다.');
      }
      return false;
    }
  };

  // 바코드 스캔 초기화
  const initScanner = async () => {
    console.log('Initializing scanner...');
    
    // 먼저 카메라 권한 확인
    const hasPermission = await checkCameraPermission();
    if (!hasPermission) {
      console.log('Camera permission denied');
      return;
    }

    if (!scannerRef.current) {
      console.error('Scanner ref not available');
      return;
    }

    try {
      console.log('Starting Quagga initialization...');
      console.log('Scanner ref element:', scannerRef.current);
      
      // Ensure the target element exists and is visible
      if (!scannerRef.current) {
        console.error('Scanner ref element not found');
        setReturnError('스캐너 요소를 찾을 수 없습니다.');
        setIsScanning(false);
        return;
      }

      // 스캐너 컨테이너를 명확하게 표시
      scannerRef.current.style.display = 'block';
      scannerRef.current.style.visibility = 'visible';
      
      Quagga.init({
        inputStream: {
          name: "Live",
          type: "LiveStream",
          target: scannerRef.current,
          constraints: {
            facingMode: "environment", // 후면 카메라 사용
            width: { min: 640 },
            height: { min: 480 }
          }
        },
        decoder: {
          readers: ["code_128_reader", "ean_reader", "ean_8_reader", "code_39_reader", "code_39_vin_reader", "codabar_reader", "upc_reader", "upc_e_reader", "i2of5_reader"]
        },
        locate: true
      }, (err: any) => {
        console.log('Quagga init callback called, err:', err);
        if (err) {
          console.error('Scanner initialization failed:', err);
          setReturnError('카메라 초기화 실패: ' + (err.message || err));
          setIsScanning(false);
          return;
        }
        
        console.log('Quagga initialized successfully, starting...');
        Quagga.start();
        setIsScanning(true);
        setReturnError(''); // 이전 오류 메시지 클리어
        console.log('Scanner started successfully');
        
        // 카메라 요소가 실제로 생성되었는지 확인
        setTimeout(() => {
          const videoElement = scannerRef.current?.querySelector('video');
          if (videoElement) {
            console.log('Video element found:', videoElement);
            console.log('Video readyState:', videoElement.readyState);
            console.log('Video srcObject:', videoElement.srcObject);
          } else {
            console.error('Video element not found in scanner container');
            setReturnError('카메라 요소를 찾을 수 없습니다. 브라우저를 새로고침하고 다시 시도해주세요.');
          }
        }, 2000);
        
        // 5초 후에도 카메라가 보이지 않으면 안내 메시지 표시
        setTimeout(() => {
          if (isScanning && scannerRef.current && !scannerRef.current.querySelector('video')) {
            setReturnError('실시간 카메라가 작동하지 않습니다. "Take Photo" 버튼을 사용하여 사진을 찍어주세요.');
          }
        }, 5000);
      });

      // 바코드 감지 이벤트
      Quagga.onDetected((result: any) => {
        console.log('Barcode detected:', result);
        const code = result.codeResult.code;
        setReturnBookId(code);
        stopScanner();
        setReturnError('');
        setBookInfo(null);
        setReturnSuccess(false);
        
        // 입력 필드에 포커스하고 자동으로 Return 처리
        if (bookReturnInputRef.current) {
          bookReturnInputRef.current.focus();
          // 잠시 후 자동으로 Return 처리
          setTimeout(() => {
            handleBookReturn();
          }, 500);
        }
      });

      // 스캔 진행 상태 모니터링
      Quagga.onProcessed((result: any) => {
        console.log('Processing result:', result);
      });

    } catch (error) {
      console.error('Error in initScanner:', error);
      setReturnError('스캐너 초기화 중 오류 발생: ' + error);
      setIsScanning(false);
    }
  };

  // 스캐너 중지
  const stopScanner = () => {
    console.log('Stopping scanner...');
    Quagga.stop();
    setIsScanning(false);
  };

  // 카메라 버튼 클릭 핸들러
  const handleCameraClick = () => {
    console.log('Camera button clicked, current scanning state:', isScanning);
    
    if (isScanning) {
      console.log('Stopping scanner...');
      stopScanner();
    } else {
      console.log('Starting scanner...');
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        initScanner();
      }, 100);
    }
  };

  // 컴포넌트 언마운트 시 스캐너 정리
  useEffect(() => {
    return () => {
      if (isScanning) {
        Quagga.stop();
      }
    };
  }, [isScanning]);

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
            {/* 실시간 카메라 스캔 버튼 */}
            <button
              type="button"
              className={`flex items-center justify-center w-12 h-10 ${isScanning ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors font-bold text-base${loadingReturn ? ' opacity-60 cursor-not-allowed' : ''}`}
              title={isScanning ? "Stop Scanning" : "Live Scan"}
              onClick={handleCameraClick}
              disabled={loadingReturn}
            >
              {isScanning ? (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </button>
            {/* 사진 촬영 버튼 */}
            <button
              type="button"
              className="flex items-center justify-center w-12 h-10 bg-green-600 hover:bg-green-700 text-white rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors font-bold text-base"
              title="Take Photo"
              onClick={handleTakePhotoClick}
              disabled={loadingReturn}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            {/* 숨겨진 사진 촬영 입력 */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleTakePhoto}
              style={{ display: 'none' }}
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

          {/* 바코드 스캐너 영역 */}
          {isScanning && (
            <div className="mt-4 p-4 border border-blue-300 rounded-lg bg-blue-50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-800">바코드를 카메라에 비춰주세요</span>
                <button
                  onClick={stopScanner}
                  className="text-blue-600 hover:text-blue-800 text-sm underline"
                >
                  스캔 중지
                </button>
              </div>
              <div 
                ref={scannerRef} 
                className="w-full h-64 bg-black rounded border-2 border-blue-400 overflow-hidden"
                style={{ position: 'relative', minHeight: '256px' }}
              />
            </div>
          )}

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
