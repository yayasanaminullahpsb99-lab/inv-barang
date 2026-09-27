import React from 'react';
import { X, Barcode, Tag, Building2, Layers, CheckCircle2 } from 'lucide-react';
import { InventoryItem } from '../types/inventory';

interface PhotoViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  photoUrl: string | null;
  item: InventoryItem | null;
}

export const PhotoViewerModal: React.FC<PhotoViewerModalProps> = ({
  isOpen,
  onClose,
  photoUrl,
  item,
}) => {
  if (!isOpen || !photoUrl || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/85 backdrop-blur-xs">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <Barcode className="w-4 h-4 text-sky-400" />
            <h3 className="font-bold text-sm text-white">
              Foto Bukti Label Barang (No Seri: {item.serialNumber})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Image Container */}
        <div className="p-4 bg-slate-950 flex items-center justify-center max-h-[500px] overflow-hidden">
          <img
            src={photoUrl}
            alt={item.serialNumber}
            className="max-h-[460px] w-auto max-w-full object-contain rounded-lg shadow-lg"
          />
        </div>

        {/* Footer Details */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 font-bold block uppercase">No Seri</span>
            <span className="font-mono font-bold text-slate-900">{item.serialNumber}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold block uppercase">Merk</span>
            <span className="font-bold text-slate-800">{item.brand}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold block uppercase">Type / Model</span>
            <span className="font-semibold text-slate-700">{item.type}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold block uppercase">Distributor</span>
            <span className="font-medium text-slate-700 truncate block">{item.distributor}</span>
          </div>
        </div>

      </div>
    </div>
  );
};
