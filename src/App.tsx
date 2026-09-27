/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Camera, 
  Upload, 
  PlusCircle, 
  FileSpreadsheet, 
  Copy, 
  Check, 
  Sparkles, 
  Package, 
  Search, 
  Layers, 
  Truck, 
  Barcode, 
  AlertCircle,
  HelpCircle,
  Share2,
  FileCheck
} from 'lucide-react';
import { Header } from './components/Header';
import { StatsBar } from './components/StatsBar';
import { SpreadsheetTable } from './components/SpreadsheetTable';
import { CameraScanner } from './components/CameraScanner';
import { FileUploadScanner } from './components/FileUploadScanner';
import { ItemFormModal } from './components/ItemFormModal';
import { GoogleSheetsModal } from './components/GoogleSheetsModal';
import { SamplePhotosModal } from './components/SamplePhotosModal';
import { PhotoViewerModal } from './components/PhotoViewerModal';

import { InventoryItem, OCRScanResultItem } from './types/inventory';
import { INITIAL_INVENTORY_ITEMS } from './utils/sampleData';
import { exportToExcel, exportToCSV, copyForGoogleSheets } from './utils/exportUtils';

export default function App() {
  // Inventory state loaded from LocalStorage
  const [items, setItems] = useState<InventoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('smartrekap_inventory_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse saved inventory:', e);
    }
    return INITIAL_INVENTORY_ITEMS;
  });

  // Save to localStorage whenever items change
  useEffect(() => {
    try {
      localStorage.setItem('smartrekap_inventory_v1', JSON.stringify(items));
    } catch (e) {
      console.error('LocalStorage write failed:', e);
    }
  }, [items]);

  // Modal visibility states
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formModalMode, setFormModalMode] = useState<'add' | 'edit' | 'ocr-review'>('add');
  const [selectedItemForForm, setSelectedItemForForm] = useState<Partial<InventoryItem> | null>(null);

  const [isGoogleSheetsOpen, setIsGoogleSheetsOpen] = useState(false);
  const [isSampleModalOpen, setIsSampleModalOpen] = useState(false);
  
  // Photo viewer modal state
  const [viewerState, setViewerState] = useState<{
    isOpen: boolean;
    photoUrl: string | null;
    item: InventoryItem | null;
  }>({
    isOpen: false,
    photoUrl: null,
    item: null,
  });

  // Notification Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Known distributors list for autocomplete suggestions
  const knownDistributors = useMemo(() => {
    return Array.from(new Set(items.map((i) => i.distributor).filter(Boolean)));
  }, [items]);

  // Handle OCR extracted items from Camera, File Upload, or Sample presets
  const handleItemsExtracted = (extractedItems: OCRScanResultItem[], photoDataUrlOrUrls: string | string[]) => {
    if (!extractedItems || extractedItems.length === 0) return;

    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);

    // If single item extracted, open the verification review modal so user can check/confirm
    if (extractedItems.length === 1) {
      const single = extractedItems[0];
      const photoUrl = typeof photoDataUrlOrUrls === 'string' ? photoDataUrlOrUrls : photoDataUrlOrUrls[0];

      setSelectedItemForForm({
        id: 'inv-' + Date.now(),
        serialNumber: single.serialNumber || '',
        brand: single.brand || '',
        type: single.type || '',
        distributor: single.distributor || '',
        itemName: single.itemName || `${single.brand} ${single.type}`.trim(),
        category: single.category || 'Komputer & IT',
        dateAdded: timestamp,
        status: 'Diverifikasi',
        notes: single.notes || '',
        confidence: single.confidence || 'Tinggi',
        rawText: single.rawText || '',
        photoUrl: photoUrl || undefined,
      });

      setFormModalMode('ocr-review');
      setIsFormModalOpen(true);
    } else {
      // If multiple items detected in batch scan, add all to spreadsheet directly
      const newItems: InventoryItem[] = extractedItems.map((item, idx) => {
        const photoUrl = Array.isArray(photoDataUrlOrUrls)
          ? photoDataUrlOrUrls[idx % photoDataUrlOrUrls.length]
          : photoDataUrlOrUrls;

        return {
          id: 'inv-' + Date.now() + '-' + idx,
          serialNumber: item.serialNumber || `SN-AUTO-${Math.floor(Math.random() * 90000 + 10000)}`,
          brand: item.brand || 'Umum',
          type: item.type || 'Model Standar',
          distributor: item.distributor || 'Distributor Umum',
          itemName: item.itemName || `${item.brand} ${item.type}`.trim(),
          category: item.category || 'Komputer & IT',
          dateAdded: timestamp,
          status: 'Diverifikasi',
          notes: item.notes || '',
          confidence: item.confidence || 'Tinggi',
          rawText: item.rawText || '',
          photoUrl: photoUrl || undefined,
        };
      });

      setItems((prev) => [...newItems, ...prev]);
      showToast(`Berhasil merekap ${newItems.length} barang baru ke dalam spreadsheet!`, 'success');
    }
  };

  // Add / Edit Item Save handler
  const handleSaveItem = (itemData: Partial<InventoryItem>) => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);

    if (itemData.id && items.some((i) => i.id === itemData.id)) {
      // Edit existing item
      setItems((prev) =>
        prev.map((it) => (it.id === itemData.id ? ({ ...it, ...itemData } as InventoryItem) : it))
      );
      showToast(`Data barang No Seri ${itemData.serialNumber} berhasil diperbarui.`);
    } else {
      // Add new item
      const newItem: InventoryItem = {
        id: itemData.id || 'inv-' + Date.now(),
        serialNumber: itemData.serialNumber || '-',
        brand: itemData.brand || '-',
        type: itemData.type || '-',
        distributor: itemData.distributor || '-',
        itemName: itemData.itemName || `${itemData.brand} ${itemData.type}`,
        category: itemData.category || 'Komputer & IT',
        dateAdded: itemData.dateAdded || timestamp,
        status: itemData.status || 'Diverifikasi',
        notes: itemData.notes || '',
        photoUrl: itemData.photoUrl,
        confidence: itemData.confidence || 'Tinggi',
        rawText: itemData.rawText,
      };

      setItems((prev) => [newItem, ...prev]);
      showToast(`Barang No Seri ${newItem.serialNumber} berhasil ditambahkan ke spreadsheet.`);
    }
  };

  // Update single field inline
  const handleUpdateItem = (id: string, updatedFields: Partial<InventoryItem>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updatedFields } : item))
    );
  };

  // Delete single item
  const handleDeleteItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    showToast('Baris barang telah dihapus dari rekap.', 'info');
  };

  // Delete multiple items
  const handleDeleteMultiple = (ids: string[]) => {
    setItems((prev) => prev.filter((item) => !ids.includes(item.id)));
    showToast(`${ids.length} baris barang berhasil dihapus dari rekap.`, 'info');
  };

  // Open Edit Form
  const handleEditClick = (item: InventoryItem) => {
    setSelectedItemForForm(item);
    setFormModalMode('edit');
    setIsFormModalOpen(true);
  };

  // Open Manual Add Form
  const handleOpenManualAdd = () => {
    setSelectedItemForForm(null);
    setFormModalMode('add');
    setIsFormModalOpen(true);
  };

  // Export Excel
  const handleExportExcel = () => {
    exportToExcel(items, 'Rekap_Inventaris_SmartRekap.xlsx');
    showToast('File Excel (.xlsx) berhasil diunduh.', 'success');
  };

  // Copy for Google Sheets
  const handleCopyGoogleSheets = async () => {
    const success = await copyForGoogleSheets(items);
    if (success) {
      setCopiedSuccess(true);
      showToast('Seluruh data tabel telah tersalin! Buka Google Sheets dan tekan Ctrl + V.', 'success');
      setTimeout(() => setCopiedSuccess(false), 3000);
    } else {
      showToast('Gagal menyalin ke clipboard. Coba unduh file Excel.', 'error');
    }
  };

  // Open Photo Viewer
  const handleViewPhoto = (photoUrl: string, item: InventoryItem) => {
    setViewerState({
      isOpen: true,
      photoUrl,
      item,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-blue-100 selection:text-blue-900">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-bounce duration-300">
          <div
            className={`px-4 py-3 rounded-xl shadow-xl border flex items-center gap-2.5 text-xs font-semibold text-white ${
              toast.type === 'success'
                ? 'bg-emerald-600 border-emerald-500 shadow-emerald-500/20'
                : toast.type === 'error'
                ? 'bg-rose-600 border-rose-500 shadow-rose-500/20'
                : 'bg-slate-800 border-slate-700 shadow-slate-900/30'
            }`}
          >
            {toast.type === 'success' && <Check className="w-4 h-4 stroke-[3]" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4" />}
            {toast.type === 'info' && <Sparkles className="w-4 h-4 text-sky-400" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Main Header */}
      <Header
        onOpenLiveCamera={() => setIsCameraOpen(true)}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenManualAdd={handleOpenManualAdd}
        onExportExcel={handleExportExcel}
        onCopyGoogleSheets={handleCopyGoogleSheets}
        onOpenGoogleSheetsModal={() => setIsGoogleSheetsOpen(true)}
        onOpenSampleModal={() => setIsSampleModalOpen(true)}
        copiedSuccess={copiedSuccess}
        totalItems={items.length}
      />

      {/* Main Container */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col">
        
        {/* Banner Quick Scan CTA */}
        <div className="mb-6 rounded-2xl bg-linear-to-r from-blue-700 via-indigo-700 to-sky-600 text-white p-5 sm:p-6 shadow-md shadow-blue-500/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-bold tracking-wide uppercase backdrop-blur-xs">
              <Sparkles className="w-3 h-3 text-sky-200" />
              <span>Sistem OCR Inventaris Otomatis</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Scan Label &amp; Rekap Barang Otomatis ke Spreadsheet
            </h2>
            <p className="text-xs sm:text-sm text-blue-100 max-w-2xl leading-relaxed">
              Cukup arahkan kamera ke stiker barcode / surat jalan barang. AI membaca dan mengekstrak <strong className="text-white font-bold">No Seri</strong>, <strong className="text-white font-bold">Merk</strong>, <strong className="text-white font-bold">Type</strong>, dan <strong className="text-white font-bold">Distributor</strong> secara akurat ke dalam format spreadsheet yang siap diunduh atau disinkronisasi.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => setIsCameraOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-blue-800 font-bold text-xs shadow-sm hover:bg-blue-50 active:scale-95 transition-all cursor-pointer"
            >
              <Camera className="w-4 h-4 text-blue-600" />
              <span>Scan Kamera</span>
            </button>
            <button
              onClick={() => setIsUploadOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-800/60 hover:bg-blue-800 text-white border border-white/20 font-bold text-xs active:scale-95 transition-all cursor-pointer backdrop-blur-xs"
            >
              <Upload className="w-4 h-4 text-sky-200" />
              <span>Unggah Batch Foto</span>
            </button>
            <button
              onClick={() => setIsSampleModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold active:scale-95 transition-all cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-sky-200" />
              <span>Contoh Foto</span>
            </button>
          </div>
        </div>

        {/* Real-time Stats & Duplicate Warning */}
        <StatsBar items={items} />

        {/* Live Interactive Spreadsheet Table */}
        <div className="flex-1 flex flex-col">
          <SpreadsheetTable
            items={items}
            onUpdateItem={handleUpdateItem}
            onDeleteItem={handleDeleteItem}
            onDeleteMultiple={handleDeleteMultiple}
            onEditClick={handleEditClick}
            onViewPhoto={handleViewPhoto}
          />
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-medium">
            SmartRekap OCR • Integrasi Data No Seri, Merk, Type &amp; Distributor ke Spreadsheet
          </p>
          <div className="flex items-center gap-3 text-slate-400">
            <span>Ekspor Excel (.xlsx)</span>
            <span>•</span>
            <span>Google Sheets Compatible</span>
            <span>•</span>
            <span>OCR Multimodal AI</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <CameraScanner
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onItemsExtracted={handleItemsExtracted}
        knownDistributors={knownDistributors}
      />

      <FileUploadScanner
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onItemsExtracted={handleItemsExtracted}
        knownDistributors={knownDistributors}
      />

      <ItemFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSaveItem}
        initialData={selectedItemForForm}
        mode={formModalMode}
        existingItems={items}
      />

      <GoogleSheetsModal
        isOpen={isGoogleSheetsOpen}
        onClose={() => setIsGoogleSheetsOpen(false)}
        items={items}
      />

      <SamplePhotosModal
        isOpen={isSampleModalOpen}
        onClose={() => setIsSampleModalOpen(false)}
        onItemsExtracted={handleItemsExtracted}
      />

      <PhotoViewerModal
        isOpen={viewerState.isOpen}
        onClose={() => setViewerState({ isOpen: false, photoUrl: null, item: null })}
        photoUrl={viewerState.photoUrl}
        item={viewerState.item}
      />

    </div>
  );
}
