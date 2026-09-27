import React from 'react';
import { 
  Package, 
  Barcode, 
  Layers, 
  Truck, 
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import { InventoryItem } from '../types/inventory';

interface StatsBarProps {
  items: InventoryItem[];
}

export const StatsBar: React.FC<StatsBarProps> = ({ items }) => {
  const totalItems = items.length;
  
  // Count unique serial numbers and detect duplicates
  const serialCounts = new Map<string, number>();
  items.forEach((item) => {
    if (item.serialNumber && item.serialNumber !== '-' && item.serialNumber !== 'N/A') {
      const normalized = item.serialNumber.trim().toUpperCase();
      serialCounts.set(normalized, (serialCounts.get(normalized) || 0) + 1);
    }
  });

  const duplicateSerials: string[] = [];
  serialCounts.forEach((count, sn) => {
    if (count > 1) duplicateSerials.push(sn);
  });

  const uniqueBrands = new Set(items.map((i) => i.brand?.trim().toLowerCase()).filter(Boolean)).size;
  const uniqueDistributors = new Set(items.map((i) => i.distributor?.trim().toLowerCase()).filter(Boolean)).size;

  const verifiedCount = items.filter((i) => i.status === 'Diverifikasi' || i.status === 'Masuk Gudang').length;
  const verificationPercent = totalItems > 0 ? Math.round((verifiedCount / totalItems) * 100) : 100;

  return (
    <div className="space-y-3 mb-6">
      {/* Duplicate warning alert banner */}
      {duplicateSerials.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-3.5 flex items-start gap-3 shadow-2xs">
          <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
              Perhatian: Terdeteksi {duplicateSerials.length} Duplikat No Seri (Double Scan)
            </h4>
            <p className="text-xs text-amber-800 mt-0.5">
              Terdapat nomor seri yang terinput lebih dari sekali: <span className="font-mono font-semibold">{duplicateSerials.slice(0, 3).join(', ')}{duplicateSerials.length > 3 ? ` (+${duplicateSerials.length - 3} lainnya)` : ''}</span>. Periksa kolom No Seri pada tabel.
            </p>
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Total Barang */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Rekap</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 font-mono">{totalItems}</span>
            <span className="text-xs text-slate-500 font-medium">unit barang</span>
          </div>
        </div>

        {/* No Seri */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">No Seri (SN)</span>
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              duplicateSerials.length > 0 ? 'bg-amber-50 text-amber-600' : 'bg-indigo-50 text-indigo-600'
            }`}>
              <Barcode className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 font-mono">{serialCounts.size}</span>
            <span className="text-xs text-slate-500 font-medium">kode unik</span>
          </div>
        </div>

        {/* Merk */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Merk Terdata</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 font-mono">{uniqueBrands}</span>
            <span className="text-xs text-slate-500 font-medium">brand</span>
          </div>
        </div>

        {/* Distributor */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Distributor</span>
            <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 font-mono">{uniqueDistributors}</span>
            <span className="text-xs text-slate-500 font-medium">supplier</span>
          </div>
        </div>

        {/* OCR Status */}
        <div className="col-span-2 sm:col-span-2 lg:col-span-1 bg-linear-to-br from-slate-900 to-slate-800 p-3.5 rounded-xl text-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-300">Validitas Data</span>
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-emerald-400 font-mono">{verificationPercent}%</span>
            <span className="text-xs text-slate-300">terverifikasi</span>
          </div>
        </div>
      </div>
    </div>
  );
};
