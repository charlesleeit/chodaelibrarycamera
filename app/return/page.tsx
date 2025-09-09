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
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const captureCanvasRef = useRef<HTMLCanvasElement>(null);

  // 컴포넌트 언마운트 시 카메라 정리
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // 카메라 시작 - 더 간단한 방법
  const startCamera = async () => {
    try {
      setCameraError('');
      
      // 가장 기본적인 방법으로 시도
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment' 
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsCameraOpen(true);
      }
    } catch (error) {
      console.error('Camera error:', error);
      setCameraError('카메라를 사용할 수 없습니다. 바코드를 직접 입력해주세요.');
    }
  };

  // 카메라 중지
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraOpen(false);
    setCapturedImage(null);
  };

  // 사진 촬영
  const capturePhoto = () => {
    if (!videoRef.current || !captureCanvasRef.current) return;

    const video = videoRef.current;
    const canvas = captureCanvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    const imageData = canvas.toDataURL('image/png');
    setCapturedImage(imageData);
  };

  // 촬영된 사진에서 바코드 스캔
  const scanCapturedImage = async () => {
    if (!capturedImage || !canvasRef.current) return;

    const img = new Image();
    img.onload = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
        
      try {
        const { BrowserMultiFormatReader, NotFoundException } = await import('@zxing/library');
        const reader = new BrowserMultiFormatReader();
        
        // Canvas에서 이미지 데이터를 가져와서 스캔
        const imageData = canvas.toDataURL('image/png');
        const img = new Image();
        img.onload = async () => {
          try {
            const result = await reader.decodeFromImageElement(img);
            if (result) {
              const barcode = result.getText();
              setReturnBookId(barcode);
              setCameraError('');
              setCapturedImage(null);
              
              // 자동으로 반납 처리
              setTimeout(async () => {
                await handleBookReturn();
              }, 500);
            }
          } catch (error) {
            if (error instanceof NotFoundException) {
              setCameraError('촬영된 사진에서 바코드를 찾을 수 없습니다. 다시 촬영해주세요.');
            } else {
              console.error('Barcode scan error:', error);
              setCameraError('바코드 스캔 중 오류가 발생했습니다.');
            }
          }
        };
        img.src = imageData;
      } catch (error) {
        console.error('Barcode scan error:', error);
        setCameraError('바코드 스캔 중 오류가 발생했습니다.');
      }
    };
    img.src = capturedImage;
  };

  // 사진 다시 촬영
  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

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
          {/* 바코드 스캔 버튼 */}
          <div className="text-center">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (isCameraOpen) {
                  stopCamera();
                } else {
                  startCamera();
                }
              }}
              className={`px-8 py-4 rounded-lg text-white font-medium transition-colors text-lg ${
                isCameraOpen 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-blue-600 hover:bg-blue-700'
              } ${loadingReturn ? 'opacity-60 cursor-not-allowed' : ''}`}
              disabled={loadingReturn}
              title={isCameraOpen ? 'Stop Camera' : 'Start Camera'}
              style={{ 
                WebkitTouchCallout: 'none',
                WebkitUserSelect: 'none',
                userSelect: 'none'
              }}
            >
              {loadingReturn ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-2 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                  </svg>
                  처리 중...
                </>
              ) : isCameraOpen ? '⏹️ 카메라 중지' : '📷 바코드 스캔'}
            </button>
            <p className="text-sm text-gray-600 mt-2">
              {loadingReturn ? '도서 반납 처리 중...' : isCameraOpen ? '바코드를 카메라에 비춰주세요' : '바코드를 스캔하려면 버튼을 클릭하세요'}
            </p>
          </div>

          {/* Camera Error */}
          {cameraError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              {cameraError}
              <div className="mt-2 text-xs">
                <strong>해결 방법:</strong>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>브라우저 주소창의 카메라 아이콘을 클릭하여 권한 허용</li>
                  <li>Chrome, Firefox, Safari 최신 버전 사용</li>
                  <li>HTTPS 또는 localhost에서 실행</li>
                  <li>다른 앱에서 카메라 사용 중이면 종료</li>
                </ul>
              </div>
            </div>
          )}

          {/* Camera Preview */}
          {isCameraOpen && !capturedImage && (
            <div className="space-y-3">
              <div className="relative">
                <video
                  ref={videoRef}
                  className="w-full h-64 bg-black rounded-md border-2 border-blue-400"
                  playsInline
                  webkit-playsinline="true"
                  muted
                  autoPlay
                  controls={false}
                  style={{ 
                    objectFit: 'cover',
                    width: '100%',
                    height: '100%'
                  }}
                />
                <div className="absolute inset-0 border-2 border-dashed border-blue-400 rounded-md pointer-events-none opacity-50"></div>
                <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white text-xs p-2 rounded">
                  <div>카메라 상태: {isCameraOpen ? '활성' : '비활성'}</div>
                  <div>비디오 크기: {videoRef.current?.videoWidth || 0}x{videoRef.current?.videoHeight || 0}</div>
                </div>
              </div>
              
              <div className="flex gap-2 justify-center">
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
                >
                  📸 사진 촬영
                </button>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 font-medium"
                >
                  취소
                </button>
              </div>
            </div>
          )}

          {/* Captured Photo Preview */}
          {capturedImage && (
            <div className="space-y-3">
              <div className="relative">
                <img
                  src={capturedImage}
                  alt="Captured barcode"
                  className="w-full h-64 bg-black rounded-md border-2 border-green-400 object-cover"
                />
                <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white text-xs p-2 rounded">
                  <div>촬영된 사진</div>
                </div>
              </div>
              
              <div className="flex gap-2 justify-center">
                <button
                  type="button"
                  onClick={scanCapturedImage}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
                >
                  🔍 바코드 스캔
                </button>
                <button
                  type="button"
                  onClick={retakePhoto}
                  className="px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 font-medium"
                >
                  📷 다시 촬영
                </button>
                <button
                  type="button"
                  onClick={() => setCapturedImage(null)}
                  className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 font-medium"
                >
                  취소
                </button>
              </div>
            </div>
          )}

          {/* Hidden Canvas for Barcode Detection */}
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          <canvas ref={captureCanvasRef} style={{ display: 'none' }} />

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