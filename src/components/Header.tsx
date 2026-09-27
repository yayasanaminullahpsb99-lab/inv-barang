import React from 'react';
import { 
  Camera, 
  Upload, 
  PlusCircle, 
  FileSpreadsheet, 
  Copy, 
  Sparkles, 
  CheckCheck,
  Share2,
  HelpCircle
} from 'lucide-react';

interface HeaderProps {
  onOpenLiveCamera: () => void;
  onOpenUpload: () => void;
  onOpenManualAdd: () => void;
  onExportExcel: () => void;
  onCopyGoogleSheets: () => void;
  onOpenGoogleSheetsModal: () => void;
  onOpenSampleModal: () => void;
  copiedSuccess: boolean;
  totalItems: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenLiveCamera,
  onOpenUpload,
  onOpenManualAdd,
  onExportExcel,
  onCopyGoogleSheets,
  onOpenGoogleSheetsModal,
  onOpenSampleModal,
  copiedSuccess,
  totalItems,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between py-3.5 gap-4">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-linear-to-tr from-blue-600 via-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 ring-2 ring-blue-100">
              <Camera className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-slate-900 font-sans">
                  SmartRekap <span className="text-blue-600">OCR</span>
                </h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Sparkles className="w-3 h-3 text-emerald-500" />
                  Gemini OCR Vision
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Rekap Barang Otomatis ke Spreadsheet (No Seri, Merk, Type, Distributor)
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenSampleModal}
              title="Coba dengan contoh foto label barang"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-all cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
              <span>Contoh Foto Label</span>
            </button>

            <button
              onClick={onOpenManualAdd}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs transition-all cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5 text-slate-600" />
              <span>Input Manual</span>
            </button>

            <button
              onClick={onOpenUpload}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-all cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-blue-600" />
              <span>Unggah Foto</span>
            </button>

            <button
              onClick={onOpenLiveCamera}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg text-white bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-sm shadow-blue-500/25 transition-all cursor-pointer active:scale-98"
            >
              <Camera className="w-4 h-4" />
              <span>Scan Kamera Langsung</span>
            </button>

            <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block" />

            {/* Spreadsheet Integration buttons */}
            <button
              onClick={onCopyGoogleSheets}
              title="Salin data ke clipboard dalam format tabel spreadsheet"
              className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                copiedSuccess
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              {copiedSuccess ? (
                <>
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Tersalin! Paste ke Sheet</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Salin ke Sheets</span>
                </>
              )}
            </button>

            <button
              onClick={onExportExcel}
              disabled={totalItems === 0}
              title="Unduh file Microsoft Excel (.xlsx)"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg text-emerald-900 bg-white hover:bg-emerald-50 border border-emerald-300 shadow-2xs transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Ekspor Excel (.xlsx)</span>
            </button>

            <button
              onClick={onOpenGoogleSheetsModal}
              title="Koneksikan Webhook langsung ke Google Sheets milik Anda"
              className="inline-flex items-center gap-1.5 px-2.5 py-2 text-xs font-semibold rounded-lg text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-blue-500" />
              <span>Sync Cloud</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
