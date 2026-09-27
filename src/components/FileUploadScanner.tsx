import React, { useState, useRef } from 'react';
import { 
  Upload, 
  X, 
  Sparkles, 
  Loader2, 
  Image as ImageIcon, 
  CheckCircle2, 
  AlertCircle,
  Building2,
  Trash2,
  Plus
} from 'lucide-react';
import { OCRScanResultItem } from '../types/inventory';

interface FileUploadScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onItemsExtracted: (items: OCRScanResultItem[], photoDataUrls: string[]) => void;
  knownDistributors: string[];
}

interface ImageUploadItem {
  id: string;
  name: string;
  dataUrl: string;
  mimeType: string;
  status: 'pending' | 'processing' | 'done' | 'error';
  extractedCount?: number;
  error?: string;
}

export const FileUploadScanner: React.FC<FileUploadScannerProps> = ({
  isOpen,
  onClose,
  onItemsExtracted,
  knownDistributors,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [images, setImages] = useState<ImageUploadItem[]>([]);
  const [defaultDistributor, setDefaultDistributor] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentProcessingIndex, setCurrentProcessingIndex] = useState<number>(-1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setErrorMessage(null);

    const filesArray = Array.from(fileList);
    const validImages = filesArray.filter((file) => file.type.startsWith('image/'));

    if (validImages.length === 0) {
      setErrorMessage('Harap pilih file gambar yang valid (JPG, PNG, WEBP).');
      return;
    }

    validImages.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          setImages((prev) => [
            ...prev,
            {
              id: Math.random().toString(36).substring(2, 9),
              name: file.name,
              dataUrl: result,
              mimeType: file.type || 'image/jpeg',
              status: 'pending',
            },
          ]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const clearAllImages = () => {
    setImages([]);
    setErrorMessage(null);
  };

  const processAllOCR = async () => {
    if (images.length === 0) return;

    setIsProcessing(true);
    setErrorMessage(null);

    const allExtracted: OCRScanResultItem[] = [];
    const usedPhotos: string[] = [];

    for (let i = 0; i < images.length; i++) {
      setCurrentProcessingIndex(i);
      setImages((prev) =>
        prev.map((item, idx) => (idx === i ? { ...item, status: 'processing' } : item))
      );

      try {
        const currentImg = images[i];
        const res = await fetch('/api/ocr-scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: currentImg.dataUrl,
            mimeType: currentImg.mimeType,
            defaultDistributor: defaultDistributor.trim(),
          }),
        });

        const resData = await res.json();
        if (!res.ok || !resData.ok) {
          throw new Error(resData.error || 'Gagal memproses OCR pada gambar ini.');
        }

        const items: OCRScanResultItem[] = resData.data?.items || [];
        allExtracted.push(...items);
        usedPhotos.push(currentImg.dataUrl);

        setImages((prev) =>
          prev.map((item, idx) =>
            idx === i ? { ...item, status: 'done', extractedCount: items.length } : item
          )
        );
      } catch (err: any) {
        console.error('Error processing image index', i, err);
        setImages((prev) =>
          prev.map((item, idx) =>
            idx === i ? { ...item, status: 'error', error: err.message || 'Gagal OCR' } : item
          )
        );
      }
    }

    setIsProcessing(false);
    setCurrentProcessingIndex(-1);

    if (allExtracted.length > 0) {
      onItemsExtracted(allExtracted, usedPhotos);
      onClose();
    } else {
      setErrorMessage(
        'Tidak ada item yang berhasil diekstrak dari gambar yang diunggah. Pastikan teks nomor seri dan merk terbaca dengan jelas.'
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-xs">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight text-slate-900">
                Unggah Foto Barang (Batch / Multi-Foto)
              </h3>
              <p className="text-xs text-slate-500">
                Bisa upload 1 foto atau beberapa foto label/surat jalan sekaligus
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Distributor Setting Bar */}
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200/80 flex items-center gap-2 text-xs">
          <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="font-semibold text-slate-700 shrink-0">Distributor Bawaan:</span>
          <input
            type="text"
            list="file-distributor-suggestions"
            value={defaultDistributor}
            onChange={(e) => setDefaultDistributor(e.target.value)}
            placeholder="Contoh: PT Datascrip / PT Synnex Metrodata (opsional)"
            className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 w-full"
          />
          <datalist id="file-distributor-suggestions">
            {knownDistributors.map((d, i) => (
              <option key={i} value={d} />
            ))}
          </datalist>
        </div>

        {/* Content Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {errorMessage && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl flex items-start gap-2 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <p>{errorMessage}</p>
            </div>
          )}

          {/* Dropzone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/40 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all group"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
            <div className="w-12 h-12 rounded-xl bg-blue-50 group-hover:bg-blue-100 text-blue-600 flex items-center justify-center mb-3 transition-colors">
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-800">
              Klik untuk memilih foto atau seret foto ke sini
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Mendukung file JPG, PNG, WEBP foto stiker label, barcode, nameplate, faktur distributor
            </p>
          </div>

          {/* Image Previews Queue */}
          {images.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">
                  Foto Terpilih ({images.length})
                </span>
                {!isProcessing && (
                  <button
                    onClick={clearAllImages}
                    className="text-rose-600 hover:text-rose-800 font-semibold cursor-pointer flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    Hapus Semua
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {images.map((img, idx) => (
                  <div
                    key={img.id}
                    className={`relative rounded-xl border p-2 flex flex-col gap-1.5 transition-all overflow-hidden ${
                      img.status === 'processing'
                        ? 'border-blue-500 ring-2 ring-blue-100 bg-blue-50/30'
                        : img.status === 'done'
                        ? 'border-emerald-400 bg-emerald-50/20'
                        : img.status === 'error'
                        ? 'border-rose-400 bg-rose-50/20'
                        : 'border-slate-200 bg-slate-50/50'
                    }`}
                  >
                    <div className="h-24 w-full rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center relative">
                      <img
                        src={img.dataUrl}
                        alt={img.name}
                        className="w-full h-full object-cover"
                      />

                      {/* Status Overlay */}
                      {img.status === 'processing' && (
                        <div className="absolute inset-0 bg-blue-900/50 flex items-center justify-center text-white backdrop-blur-2xs">
                          <Loader2 className="w-6 h-6 animate-spin text-white" />
                        </div>
                      )}

                      {img.status === 'done' && (
                        <div className="absolute bottom-1 right-1 bg-emerald-600 text-white rounded-full p-1 shadow-xs">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-1 text-[11px]">
                      <span className="truncate font-medium text-slate-700" title={img.name}>
                        {img.name}
                      </span>
                      {!isProcessing && (
                        <button
                          onClick={() => removeImage(img.id)}
                          className="text-slate-400 hover:text-rose-600 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {img.status === 'done' && (
                      <span className="text-[10px] font-bold text-emerald-700">
                        {img.extractedCount || 1} item terdeteksi
                      </span>
                    )}

                    {img.status === 'error' && (
                      <span className="text-[10px] font-bold text-rose-600 truncate">
                        {img.error}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">
            {images.length > 0 ? `${images.length} foto siap di-OCR` : 'Belum ada foto yang dipilih'}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer disabled:opacity-50"
            >
              Batal
            </button>

            <button
              onClick={processAllOCR}
              disabled={images.length === 0 || isProcessing}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>
                    Memproses Foto ({currentProcessingIndex + 1}/{images.length})...
                  </span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-blue-200" />
                  <span>Mulai Rekap OCR ({images.length} Foto)</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
