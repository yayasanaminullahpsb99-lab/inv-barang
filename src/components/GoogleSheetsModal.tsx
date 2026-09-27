import React, { useState } from 'react';
import { 
  X, 
  Share2, 
  Copy, 
  Check, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Send,
  Code
} from 'lucide-react';
import { InventoryItem } from '../types/inventory';

interface GoogleSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: InventoryItem[];
}

export const GoogleSheetsModal: React.FC<GoogleSheetsModalProps> = ({
  isOpen,
  onClose,
  items,
}) => {
  const [webhookUrl, setWebhookUrl] = useState(() => {
    return localStorage.getItem('smartrekap_sheets_webhook') || '';
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  const handleSaveWebhook = () => {
    localStorage.setItem('smartrekap_sheets_webhook', webhookUrl.trim());
  };

  const sampleAppsScriptCode = `// KODE GOOGLE APPS SCRIPT UNTUK GOOGLE SPREADSHEET
// 1. Di Google Sheets, buka menu "Extensions" > "Apps Script"
// 2. Hapus kode lama, paste kode berikut, lalu klik "Deploy" > "New deployment"
// 3. Pilih type "Web app", set "Who has access" ke "Anyone" (Siapa saja)
// 4. Salin URL Web App dan paste ke aplikasi SmartRekap OCR

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    var items = data.items || [];
    
    // Pastikan baris header sudah ada
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["Tanggal Input", "No Seri", "Merk", "Type / Model", "Distributor", "Nama Barang", "Kategori", "Status", "Catatan"]);
    }
    
    // Tambahkan setiap baris barang
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      sheet.appendRow([
        it.dateAdded || new Date().toLocaleString(),
        it.serialNumber || "-",
        it.brand || "-",
        it.type || "-",
        it.distributor || "-",
        it.itemName || "-",
        it.category || "-",
        it.status || "-",
        it.notes || "-"
      ]);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success", count: items.length }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;

  const copyScript = () => {
    navigator.clipboard.writeText(sampleAppsScriptCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSyncNow = async () => {
    if (!webhookUrl.trim()) {
      setSyncStatus({ success: false, message: 'Harap masukkan URL Webhook Google Sheets.' });
      return;
    }

    setIsSyncing(true);
    setSyncStatus(null);
    handleSaveWebhook();

    try {
      const response = await fetch('/api/sync-google-sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webhookUrl: webhookUrl.trim(),
          items,
        }),
      });

      const resData = await response.json();
      if (!response.ok || !resData.ok) {
        throw new Error(resData.error || 'Gagal mengirim ke Google Sheets.');
      }

      setSyncStatus({
        success: true,
        message: `Berhasil! ${items.length} data barang telah terkirim otomatis ke Google Spreadsheet Anda.`,
      });
    } catch (err: any) {
      setSyncStatus({
        success: false,
        message: err.message || 'Terjadi kesalahan saat menyambung ke Webhook Google Sheets.',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-xs">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-emerald-700 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-800 text-emerald-200 flex items-center justify-center border border-emerald-600">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight text-white">
                Integrasi Cloud Google Spreadsheet
              </h3>
              <p className="text-xs text-emerald-100">
                Kirim data rekap barang otomatis ke spreadsheet online milik Anda
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          
          {/* Quick Option: Clipboard */}
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-emerald-900 text-sm">
                Metode Tercepat: Salin &amp; Tempel (Copy-Paste Langsung)
              </h4>
              <p className="text-emerald-800 mt-1 leading-relaxed">
                Anda tidak perlu setup apapun! Cukup klik tombol <strong>"Salin ke Sheets"</strong> di bar atas, lalu buka Google Sheets baru dan tekan <kbd className="px-1.5 py-0.5 bg-white border border-emerald-300 rounded font-mono font-bold">Ctrl + V</kbd>. Seluruh kolom No Seri, Merk, Type, dan Distributor langsung tertata rapi seketika.
              </p>
            </div>
          </div>

          {/* Webhook Configuration Section */}
          <div className="space-y-3 pt-2">
            <div>
              <label className="font-bold text-slate-800 block text-xs mb-1">
                Atau Kirim Otomatis via Webhook Google Apps Script:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                  className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono"
                />
                <button
                  onClick={handleSyncNow}
                  disabled={isSyncing || items.length === 0}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isSyncing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Mengirim...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Kirim {items.length} Data</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {syncStatus && (
              <div
                className={`p-3 rounded-xl border flex items-start gap-2 ${
                  syncStatus.success
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : 'bg-rose-50 border-rose-300 text-rose-800'
                }`}
              >
                {syncStatus.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <span>{syncStatus.message}</span>
              </div>
            )}
          </div>

          {/* Google Apps Script instructions */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-100 px-3.5 py-2 border-b border-slate-200 flex items-center justify-between">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5 text-slate-500" />
                Skrip Google Apps Script Siap Pakai
              </span>
              <button
                onClick={copyScript}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Tersalin!' : 'Salin Kode'}</span>
              </button>
            </div>
            <pre className="p-3 bg-slate-900 text-slate-200 text-[11px] font-mono overflow-x-auto max-h-48 leading-relaxed">
              {sampleAppsScriptCode}
            </pre>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
