import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Barcode, 
  Tag, 
  Layers, 
  Building2, 
  Package, 
  FileText, 
  CheckCircle2, 
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import { InventoryItem, OCRScanResultItem } from '../types/inventory';

interface ItemFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Partial<InventoryItem>) => void;
  initialData?: Partial<InventoryItem> | null;
  mode: 'add' | 'edit' | 'ocr-review';
  existingItems: InventoryItem[];
}

export const ItemFormModal: React.FC<ItemFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  mode,
  existingItems,
}) => {
  const [serialNumber, setSerialNumber] = useState('');
  const [brand, setBrand] = useState('');
  const [type, setType] = useState('');
  const [distributor, setDistributor] = useState('');
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('Komputer & IT');
  const [status, setStatus] = useState<InventoryItem['status']>('Diverifikasi');
  const [notes, setNotes] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);
  const [rawText, setRawText] = useState<string | undefined>(undefined);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setSerialNumber(initialData.serialNumber || '');
      setBrand(initialData.brand || '');
      setType(initialData.type || '');
      setDistributor(initialData.distributor || '');
      setItemName(initialData.itemName || (initialData.brand && initialData.type ? `${initialData.brand} ${initialData.type}` : ''));
      setCategory(initialData.category || 'Komputer & IT');
      setStatus(initialData.status || 'Diverifikasi');
      setNotes(initialData.notes || '');
      setPhotoUrl(initialData.photoUrl);
      setRawText(initialData.rawText);
    } else {
      setSerialNumber('');
      setBrand('');
      setType('');
      setDistributor('');
      setItemName('');
      setCategory('Komputer & IT');
      setStatus('Diverifikasi');
      setNotes('');
      setPhotoUrl(undefined);
      setRawText(undefined);
    }
    setErrorMsg(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  // Check if serial number already exists in other items
  const isDuplicateSerial = existingItems.some(
    (item) =>
      item.id !== initialData?.id &&
      item.serialNumber &&
      serialNumber.trim() &&
      item.serialNumber.trim().toUpperCase() === serialNumber.trim().toUpperCase()
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!serialNumber.trim()) {
      setErrorMsg('Nomor Seri (Serial Number) wajib diisi.');
      return;
    }
    if (!brand.trim()) {
      setErrorMsg('Merk / Brand barang wajib diisi.');
      return;
    }
    if (!type.trim()) {
      setErrorMsg('Type / Model barang wajib diisi.');
      return;
    }
    if (!distributor.trim()) {
      setErrorMsg('Distributor wajib diisi.');
      return;
    }

    onSave({
      id: initialData?.id,
      serialNumber: serialNumber.trim(),
      brand: brand.trim(),
      type: type.trim(),
      distributor: distributor.trim(),
      itemName: itemName.trim() || `${brand.trim()} ${type.trim()}`,
      category,
      status,
      notes: notes.trim(),
      photoUrl,
      rawText,
      confidence: initialData?.confidence || 'Tinggi',
    });

    onClose();
  };

  const categories = [
    'Komputer & IT',
    'Elektronik & Pendingin',
    'Elektronik & Hiburan',
    'Alat Rumah Tangga',
    'Otomotif & Sparepart',
    'Mesin & Alat Berat',
    'Telekomunikasi & Gadget',
    'Lainnya',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-xs">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              {mode === 'ocr-review' ? <Sparkles className="w-4 h-4 text-blue-600" /> : <Tag className="w-4 h-4 text-blue-600" />}
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 tracking-tight">
                {mode === 'ocr-review'
                  ? 'Verifikasi Hasil OCR Hasil Foto'
                  : mode === 'edit'
                  ? 'Edit Data Barang'
                  : 'Input Manual Barang Baru'}
              </h3>
              <p className="text-xs text-slate-500">
                {mode === 'ocr-review'
                  ? 'Periksa dan sesuaikan data yang terbaca sebelum disimpan ke spreadsheet'
                  : 'Masukkan spesifikasi lengkap barang inventaris'}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Photo preview banner if photo exists */}
          {photoUrl && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
              <img
                src={photoUrl}
                alt="Pratinjau Foto"
                className="w-16 h-16 object-cover rounded-lg border border-slate-200 bg-white"
              />
              <div className="flex-1 text-xs">
                <span className="font-semibold text-slate-700 block">Foto Label Terlampir</span>
                {rawText && (
                  <p className="text-slate-500 text-[11px] line-clamp-2 mt-0.5 font-mono">
                    OCR: {rawText}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Serial Number (No Seri) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Barcode className="w-3.5 h-3.5 text-blue-600" />
                <span>No Seri (Serial Number / S/N)*</span>
              </label>
              {isDuplicateSerial && (
                <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Duplikat No Seri!
                </span>
              )}
            </div>
            <input
              type="text"
              required
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
              placeholder="Contoh: SN-EPS-982341-ID"
              className={`w-full px-3 py-2 text-sm font-mono font-semibold rounded-lg border focus:outline-hidden focus:ring-2 ${
                isDuplicateSerial
                  ? 'border-amber-400 bg-amber-50/30 text-amber-900 focus:ring-amber-400'
                  : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500 text-slate-900'
              }`}
            />
          </div>

          {/* Grid 2 Column: Merk & Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-1">
                <Tag className="w-3.5 h-3.5 text-blue-600" />
                <span>Merk (Brand)*</span>
              </label>
              <input
                type="text"
                required
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="Contoh: Epson, Samsung, Asus, Daikin"
                className="w-full px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-1">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                <span>Type / Model*</span>
              </label>
              <input
                type="text"
                required
                value={type}
                onChange={(e) => setType(e.target.value)}
                placeholder="Contoh: EcoTank L3210 / Vivobook 14"
                className="w-full px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Distributor */}
          <div>
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-1">
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Distributor / Pemasok Resmi*</span>
            </label>
            <input
              type="text"
              required
              value={distributor}
              onChange={(e) => setDistributor(e.target.value)}
              placeholder="Contoh: PT Datascrip Indonesia / PT Synnex Metrodata"
              className="w-full px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Nama Barang */}
          <div>
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-1">
              <Package className="w-3.5 h-3.5 text-blue-600" />
              <span>Nama Barang / Deskripsi Ringkas</span>
            </label>
            <input
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="Contoh: Printer Ink Tank Multifungsi Epson L3210"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Grid 2 Column: Kategori & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-800 mb-1 block">
                Kategori Barang
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-800 mb-1 block">
                Status Verifikasi
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-semibold"
              >
                <option value="Diverifikasi">Diverifikasi (Valid)</option>
                <option value="Menunggu Cek">Menunggu Cek</option>
                <option value="Masuk Gudang">Masuk Gudang</option>
                <option value="Retur/Rusak">Retur/Rusak</option>
              </select>
            </div>
          </div>

          {/* Catatan / Keterangan Spesifikasi */}
          <div>
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-1">
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>Catatan / Spesifikasi Tambahan</span>
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Garansi resmi 2 tahun, Made in PH, 220V"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Submit buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/25 active:scale-95 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan ke Spreadsheet</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
