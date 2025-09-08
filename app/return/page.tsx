'use client';

import { useState, useRef, useEffect } from 'react';

interface BookInfo {
  barcode: string;
  name: string;
  num?: string;
}

interface ScannerState {
  stream: MediaStream | null;
  track: MediaStreamTrack | null;
  useNative: boolean;
  reader: any;
  running: boolean;
  lastText: string;
  throttleMs: number;
  torch: boolean;
}

export default function ReturnPage() {
  const [returnBookId, setReturnBookId] = useState('');
  const [loadingReturn, setLoadingReturn] = useState(false);
  const [returnError, setReturnError] = useState('');
  const [bookInfo, setBookInfo] = useState<BookInfo | null>(null);
  const [returnSuccess, setReturnSuccess] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scannerStatus, setScannerStatus] = useState('Ready');
  const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState('');
  const [beepEnabled, setBeepEnabled] = useState(true);
  const [mirrorEnabled, setMirrorEnabled] = useState(true);
  
  const bookReturnInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const beepRef = useRef<HTMLAudioElement>(null);
  
  const [scannerState, setScannerState] = useState<ScannerState>({
    stream: null,
    track: null,
    useNative: false,
    reader: null,
    running: false,
    lastText: '',
    throttleMs: 120,
    torch: false
  });

  const SUPPORTED_FORMATS = [
    'aztec', 'code_128', 'code_39', 'code_93', 'codabar', 'data_matrix', 
    'ean_13', 'ean_8', 'itf', 'pdf417', 'qr_code', 'upc_a', 'upc_e'
  ];

  // Book Return 입력 필드에 기본 포커스 설정
  useEffect(() => {
    if (bookReturnInputRef.current) {
      bookReturnInputRef.current.focus();
    }
  }, []);

  // 컴포넌트 언마운트 시 스캐너 정리
  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  // 바코드 감지 시 소리 재생
  const playBeep = () => {
    if (beepEnabled && beepRef.current) {
      beepRef.current.play().catch(() => {});
    }
  };

  // HTML 이스케이프
  const escapeHtml = (s: string) => {
    return String(s).replace(/[&<>"']/g, m => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", 
      "\"": "&quot;", "'": "&#39;"
    }[m] || m));
  };

  // 네이티브 BarcodeDetector 지원 확인
  const hasBarcodeDetector = async () => {
    if (!('BarcodeDetector' in window)) return false;
    try {
      const formats = await (window as any).BarcodeDetector.getSupportedFormats();
      return formats && formats.length > 0;
    } catch {
      return false;
    }
  };

  // 카메라 디바이스 목록 가져오기
  const listCameras = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cams = devices.filter(d => d.kind === 'videoinput');
      setAvailableDevices(cams);
      if (cams.length > 0 && !selectedDevice) {
        setSelectedDevice(cams[0].deviceId);
      }
    } catch (e) {
      console.error('카메라 나열 실패:', e);
    }
  };

  // 스캐너 시작
  const startScanner = async () => {
    try {
      setScannerStatus('Requesting...');
      
      const constraints = {
        audio: false,
        video: {
          deviceId: selectedDevice ? { exact: selectedDevice } : undefined,
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30, max: 60 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setScannerState(prev => ({ ...prev, stream, track: stream.getVideoTracks()[0] }));
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        
        // 미러 효과 적용
        if (mirrorEnabled) {
          videoRef.current.style.transform = 'scaleX(-1)';
        }
      }

      // 손전등 지원 확인
      const cap = stream.getVideoTracks()[0].getCapabilities?.();
      const canTorch = !!(cap && (cap as any).torch);

      // 엔진 선택
      if (await hasBarcodeDetector()) {
        setScannerState(prev => ({ ...prev, useNative: true }));
        runNativeLoop();
      } else {
        setScannerState(prev => ({ ...prev, useNative: false }));
        await runZXing();
      }

      setScannerState(prev => ({ ...prev, running: true }));
      setScannerStatus('Scanning');
      setIsScanning(true);
      
    } catch (e) {
      console.error('Scanner start failed:', e);
      setScannerStatus('Error');
      setReturnError('카메라를 사용할 수 없습니다. 권한/HTTPS/브라우저를 확인하세요.');
    }
  };

  // 스캐너 중지
  const stopScanner = () => {
    setScannerState(prev => {
      if (prev.reader) {
        try {
          prev.reader.reset();
        } catch {}
      }
      if (prev.stream) {
        prev.stream.getTracks().forEach(t => t.stop());
      }
      return { ...prev, stream: null, track: null, running: false };
    });
    
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }
    
    setIsScanning(false);
    setScannerStatus('Stopped');
  };

  // 손전등 토글
  const toggleTorch = async () => {
    const track = scannerState.track;
    if (!track) return;
    
    try {
      const newTorch = !scannerState.torch;
      await track.applyConstraints({ 
        advanced: [{ torch: newTorch } as any] 
      });
      setScannerState(prev => ({ ...prev, torch: newTorch }));
    } catch (e) {
      console.error('Torch failed:', e);
    }
  };

  // 바코드 감지 처리
  const onDetected = (result: any) => {
    const now = Date.now();
    const rawValue = result?.rawValue || result?.text || '';
    
    if (rawValue === scannerState.lastText) return; // 중복 방지
    
    setScannerState(prev => ({ ...prev, lastText: rawValue }));
    setReturnBookId(rawValue);
    setReturnError('');
    setBookInfo(null);
    setReturnSuccess(false);
    
    playBeep();
    
    // 자동으로 반납 처리
    setTimeout(() => {
      handleBookReturn();
    }, 500);
  };

  // 네이티브 BarcodeDetector 루프
  const runNativeLoop = async () => {
    const detector = new (window as any).BarcodeDetector({ 
      formats: SUPPORTED_FORMATS 
    });
    const ctx = canvasRef.current?.getContext('2d', { willReadFrequently: true });
    
    if (!ctx) return;

    const loop = async () => {
      if (!scannerState.running) return;
      
      try {
        const video = videoRef.current;
        if (video && video.videoWidth && video.videoHeight) {
          if (canvasRef.current) {
            canvasRef.current.width = video.videoWidth;
            canvasRef.current.height = video.videoHeight;
            ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
            
            const barcodes = await detector.detect(canvasRef.current);
            if (barcodes && barcodes[0]) {
              onDetected({ 
                rawValue: barcodes[0].rawValue, 
                format: barcodes[0].format 
              });
            }
          }
        }
      } catch (e) {
        console.error('Native detect error:', e);
      }
      
      await new Promise(resolve => setTimeout(resolve, scannerState.throttleMs));
      requestAnimationFrame(loop);
    };
    
    loop();
  };

  // ZXing fallback 루프
  const runZXing = async () => {
    try {
      const { BrowserMultiFormatReader, NotFoundException } = await import('@zxing/library');
      const reader = new BrowserMultiFormatReader();
      setScannerState(prev => ({ ...prev, reader }));
      
      const video = videoRef.current;
      if (!video) return;

      const loop = async () => {
        if (!scannerState.running) return;
        
        try {
          const result = await reader.decodeOnce(video).catch(e => {
            if (e instanceof NotFoundException) return null;
            throw e;
          });
          
          if (result) {
            onDetected({ 
              text: result.getText(), 
              barcodeFormat: result.getBarcodeFormat?.() || 'zxing' 
            });
          }
        } catch (e) {
          console.error('ZXing error:', e);
        }
        
        await new Promise(resolve => setTimeout(resolve, scannerState.throttleMs));
        requestAnimationFrame(loop);
      };
      
      loop();
    } catch (e) {
      console.error('ZXing import failed:', e);
      setReturnError('바코드 스캐너 라이브러리를 로드할 수 없습니다.');
    }
  };

  // 카메라 버튼 클릭 핸들러
  const handleCameraClick = () => {
    if (isScanning) {
      stopScanner();
    } else {
      startScanner();
    }
  };

  const fetchBookInfo = async (barcode: string) => {
    const res = await fetch(`/api/bookcrud/scan?barcode=${encodeURIComponent(barcode)}`);
    const data = await res.json();
    if (data.success && data.book) {
      return { 
        barcode: data.book.barcode, 
        name: data.book.name + (data.book.num ? ' ' + data.book.num : '') 
      };
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

  // 초기화 시 카메라 목록 가져오기
  useEffect(() => {
    listCameras();
  }, []);

  return (
    <div className="mx-auto p-4" style={{ maxWidth: '144rem' }}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Book Return</h1>
        
        {/* Scanner Status */}
        <div className="mb-4 flex items-center gap-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            scannerStatus === 'Scanning' ? 'bg-green-100 text-green-800' :
            scannerStatus === 'Error' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {scannerStatus}
          </span>
          <span className="text-sm text-gray-600">
            {scannerState.useNative ? 'BarcodeDetector (Native)' : 'ZXing (Fallback)'}
          </span>
        </div>

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
            
            {/* Camera Device Selector */}
            <select
              value={selectedDevice}
              onChange={e => setSelectedDevice(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
              disabled={isScanning}
            >
              {availableDevices.map((device, index) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Camera ${index + 1}`}
                </option>
              ))}
            </select>

            {/* Live Scan Button */}
            <button
              type="button"
              className={`flex items-center justify-center w-12 h-10 ${
                isScanning ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
              } text-white rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors font-bold text-base${
                loadingReturn ? ' opacity-60 cursor-not-allowed' : ''
              }`}
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

            {/* Torch Button */}
            <button
              type="button"
              className={`flex items-center justify-center w-12 h-10 ${
                scannerState.torch ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-gray-600 hover:bg-gray-700'
              } text-white rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors font-bold text-base`}
              title={scannerState.torch ? "Turn Off Torch" : "Turn On Torch"}
              onClick={toggleTorch}
              disabled={!isScanning || !scannerState.track}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </button>

            <button
              type="button"
              className={`flex items-center justify-center w-16 h-10 bg-red-600 text-white rounded-full hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors font-bold text-base${
                loadingReturn ? ' opacity-60 cursor-not-allowed' : ''
              }`}
              title="Book Return Action"
              onClick={handleBookReturn}
              disabled={loadingReturn}
            >
              {loadingReturn ? (
                <svg className="animate-spin h-5 w-5 mr-1 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
              ) : 'Return'}
            </button>
          </div>

          {/* Scanner Options */}
          <div className="flex gap-4 mt-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={beepEnabled}
                onChange={e => setBeepEnabled(e.target.checked)}
                className="rounded"
              />
              Beep on scan
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={mirrorEnabled}
                onChange={e => setMirrorEnabled(e.target.checked)}
                className="rounded"
              />
              Mirror front camera
            </label>
          </div>

          {/* Scanner Preview */}
          {isScanning && (
            <div className="mt-4 p-4 border border-blue-300 rounded-lg bg-blue-50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-800">
                  Point camera at barcode
                </span>
                <button
                  onClick={stopScanner}
                  className="text-blue-600 hover:text-blue-800 text-sm underline"
                >
                  Stop Scanning
                </button>
              </div>
              <div className="relative">
                <video
                  ref={videoRef}
                  className="w-full h-64 bg-black rounded border-2 border-blue-400"
                  playsInline
                  muted
                />
                <div className="absolute inset-0 border-2 border-dashed border-blue-400 rounded pointer-events-none opacity-50"></div>
              </div>
            </div>
          )}

          {/* Hidden Canvas for Native Detection */}
          <canvas ref={canvasRef} style={{ display: 'none' }} />

          {/* Beep Audio */}
          <audio ref={beepRef} preload="auto">
            <source src="data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABYAZGZnZ2dnAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=" type="audio/wav" />
          </audio>

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