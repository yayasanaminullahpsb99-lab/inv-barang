import React, { useRef, useState, useEffect } from 'react';
import { 
  Camera, 
  X, 
  RotateCw, 
  Sparkles, 
  Check, 
  AlertCircle, 
  Loader2, 
  CheckCircle2,
  Building2,
  Layers,
  Barcode
} from 'lucide-react';
import { OCRScanResultItem } from '../types/inventory';

interface CameraScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onItemsExtracted: (items: OCRScanResultItem[], photoDataUrl: string) => void;
  knownDistributors: string[];
}

export const CameraScanner: React.FC<CameraScannerProps> = ({
  isOpen,
  onClose,
  onItemsExtracted,
  knownDistributors,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [defaultDistributor, setDefaultDistributor] = useState('');
  const [batchMode, setBatchMode] = useState(false);
  const [successCount, setSuccessCount] = useState(0);

  // Start camera stream when modal is opened
  useEffect(() => {
    if (isOpen && !capturedImage) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode, capturedImage]);

  const startCamera = async () => {
    try {
      setErrorMessage(null);
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setErrorMessage(
        'Tidak dapat mengakses kamera. Pastikan izin kamera aktif pada browser Anda atau gunakan mode Unggah Foto.'
      );
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const switchCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setCapturedImage(dataUrl);
    stopCamera();
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setErrorMessage(null);
  };

  const processOCR = async () => {
    if (!capturedImage) return;

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/ocr-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: capturedImage,
          mimeType: 'image/jpeg',
          defaultDistributor: defaultDistributor.trim(),
        }),
      });

      const resData = await response.json();

      if (!response.ok || !resData.ok) {
        throw new Error(resData.error || 'Gagal mengekstrak data dari foto');
      }

      const extractedItems: OCRScanResultItem[] = resData.data?.items || [];

      if (extractedItems.length === 0) {
        throw new Error(
          'Tidak ada teks label/barcode yang teridentifikasi. Pastikan foto cukup terang dan fokus pada tulisan No Seri/Merk.'
        );
      }

      // Notify parent
      onItemsExtracted(extractedItems, capturedImage);
      setSuccessCount((prev) => prev + extractedItems.length);

      if (batchMode) {
        // In batch mode, auto reset for next scan
        setCapturedImage(null);
      } else {
        onClose();
      }
    } catch (err: any) {
      console.error('OCR Error:', err);
      setErrorMessage(err.message || 'Terjadi kesalahan saat memproses OCR.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-xs">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-400/30">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight text-white flex items-center gap-2">
                Scan Kamera Langsung
                {batchMode && (
                  <span className="text-[10px] uppercase font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
                    Mode Beruntun (Batch)
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400">
                Arahkan kamera ke stiker barcode, kardus, atau nameplate barang
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Distributor Setting Bar */}
        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="font-medium text-slate-600 shrink-0">Distributor Bawaan:</span>
            <input
              type="text"
              list="distributor-suggestions"
              value={defaultDistributor}
              onChange={(e) => setDefaultDistributor(e.target.value)}
              placeholder="Contoh: PT Synnex Metrodata / PT Datascrip"
              className="px-2.5 py-1 text-xs rounded-md border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 w-full"
            />
            <datalist id="distributor-suggestions">
              {knownDistributors.map((d, i) => (
                <option key={i} value={d} />
              ))}
            </datalist>
          </div>

          <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-medium">
            <input
              type="checkbox"
              checked={batchMode}
              onChange={(e) => setBatchMode(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <span>Scan Beruntun</span>
            {successCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px]">
                +{successCount} masuk
              </span>
            )}
          </label>
        </div>

        {/* Camera Viewport / Freeze View */}
        <div className="relative bg-black flex-1 min-h-[320px] max-h-[500px] flex items-center justify-center overflow-hidden">
          {errorMessage && (
            <div className="absolute inset-x-4 top-4 z-20 bg-rose-50 border border-rose-300 text-rose-800 p-3 rounded-xl flex items-start gap-2 text-xs shadow-md">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">{errorMessage}</p>
                <button
                  onClick={startCamera}
                  className="mt-1 text-blue-600 font-bold underline hover:text-blue-800"
                >
                  Coba Akses Lagi
                </button>
              </div>
            </div>
          )}

          {!capturedImage ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-contain"
              />

              {/* Viewfinder Overlay */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
                <div className="w-full max-w-md h-52 sm:h-64 border-2 border-dashed border-sky-400/90 rounded-2xl relative shadow-2xl flex items-center justify-center">
                  {/* Corner accents */}
                  <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-sky-400 rounded-tl-lg" />
                  <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-sky-400 rounded-tr-lg" />
                  <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-sky-400 rounded-bl-lg" />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-sky-400 rounded-br-lg" />

                  {/* Laser scan line animation simulation */}
                  <div className="w-full h-0.5 bg-linear-to-r from-transparent via-sky-400 to-transparent shadow-[0_0_10px_#38bdf8] opacity-80" />

                  <div className="absolute bottom-3 px-3 py-1 bg-black/60 backdrop-blur-xs rounded-full text-[11px] text-white flex items-center gap-1.5 font-medium">
                    <Barcode className="w-3.5 h-3.5 text-sky-400" />
                    Posisikan No Seri &amp; Merk di dalam kotak
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={capturedImage}
                alt="Foto Tangkapan"
                className="w-full h-full object-contain"
              />
              <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-xs text-white text-xs px-2.5 py-1 rounded-md flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Foto Siap Diproses
              </div>
            </div>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Footer Controls */}
        <div className="p-4 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          {!capturedImage ? (
            <>
              <button
                type="button"
                onClick={switchCamera}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Balik Kamera</span>
              </button>

              <button
                type="button"
                onClick={capturePhoto}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md shadow-blue-500/25 active:scale-95 transition-all cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>Ambil Foto</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Batal
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={retakePhoto}
                disabled={isProcessing}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer disabled:opacity-50"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Foto Ulang</span>
              </button>

              <button
                type="button"
                onClick={processOCR}
                disabled={isProcessing}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-md shadow-emerald-500/25 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Membaca OCR dengan AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-emerald-200" />
                    <span>Mulai Rekap OCR AI</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
};
