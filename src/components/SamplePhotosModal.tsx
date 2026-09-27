import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Loader2, 
  HelpCircle, 
  Barcode, 
  Tag, 
  Building2, 
  ArrowRight,
  Eye
} from 'lucide-react';
import { SAMPLE_LABEL_PRESETS, generateSyntheticLabelDataUrl } from '../utils/sampleData';
import { OCRScanResultItem } from '../types/inventory';

interface SamplePhotosModalProps {
  isOpen: boolean;
  onClose: () => void;
  onItemsExtracted: (items: OCRScanResultItem[], photoDataUrl: string) => void;
}

export const SamplePhotosModal: React.FC<SamplePhotosModalProps> = ({
  isOpen,
  onClose,
  onItemsExtracted,
}) => {
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentPreset = SAMPLE_LABEL_PRESETS[selectedPresetIndex];
  const currentPreviewDataUrl = generateSyntheticLabelDataUrl(currentPreset.data);

  const handleTestScan = async () => {
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/ocr-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: currentPreviewDataUrl,
          mimeType: 'image/svg+xml',
          defaultDistributor: currentPreset.data.distributor,
        }),
      });

      const resData = await response.json();
      if (!response.ok || !resData.ok) {
        throw new Error(resData.error || 'Gagal memproses sampel OCR.');
      }

      const items: OCRScanResultItem[] = resData.data?.items || [];
      if (items.length === 0) {
        throw new Error('Tidak ada data barang yang terdeteksi pada gambar sampel ini.');
      }

      onItemsExtracted(items, currentPreviewDataUrl);
      onClose();
    } catch (err: any) {
      console.error('Test OCR error:', err);
      setErrorMsg(err.message || 'Terjadi kesalahan saat memproses OCR sampel.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-xs">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              <HelpCircle className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 tracking-tight">
                Uji Coba Cepat dengan Contoh Foto Label
              </h3>
              <p className="text-xs text-slate-500">
                Pilih salah satu stiker/label barang berikut untuk menguji kemampuan AI OCR
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preset Selector Tabs */}
        <div className="p-4 border-b border-slate-200/80 bg-slate-50/50 flex items-center gap-2 overflow-x-auto text-xs">
          {SAMPLE_LABEL_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedPresetIndex(idx)}
              className={`px-3 py-2 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedPresetIndex === idx
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {preset.title}
            </button>
          ))}
        </div>

        {/* Label Preview Card */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
              {errorMsg}
            </div>
          )}

          <div className="border border-slate-300 rounded-xl overflow-hidden bg-slate-100 p-2 shadow-inner">
            <div className="text-[11px] font-bold text-slate-500 mb-1 px-1 flex items-center justify-between">
              <span>Simulasi Stiker / Nameplate Barang Asli:</span>
              <span className="font-mono text-blue-600">{currentPreset.data.category}</span>
            </div>
            <img
              src={currentPreviewDataUrl}
              alt={currentPreset.title}
              className="w-full h-auto rounded-lg border border-slate-200 shadow-xs"
            />
          </div>

          {/* Target field checklist */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 font-bold block uppercase">No Seri Target</span>
              <span className="font-mono font-bold text-rose-700 truncate block mt-0.5">
                {currentPreset.data.serialNumber}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 font-bold block uppercase">Merk Target</span>
              <span className="font-bold text-slate-800 truncate block mt-0.5">
                {currentPreset.data.brand}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 font-bold block uppercase">Type Target</span>
              <span className="font-semibold text-slate-700 truncate block mt-0.5">
                {currentPreset.data.type}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 font-bold block uppercase">Distributor</span>
              <span className="font-medium text-slate-700 truncate block mt-0.5">
                {currentPreset.data.distributor}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            {currentPreset.description}
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
            >
              Tutup
            </button>
            <button
              onClick={handleTestScan}
              disabled={isProcessing}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-blue-500/25 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menganalisis OCR...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-blue-200" />
                  <span>Scan Foto Ini Sekarang</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
