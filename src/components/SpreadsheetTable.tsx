import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  Copy, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  CheckSquare, 
  Square, 
  Download, 
  FileSpreadsheet, 
  ExternalLink,
  ChevronDown,
  ArrowUpDown,
  Eye,
  Check
} from 'lucide-react';
import { InventoryItem } from '../types/inventory';
import { exportToExcel, copyForGoogleSheets } from '../utils/exportUtils';

interface SpreadsheetTableProps {
  items: InventoryItem[];
  onUpdateItem: (id: string, updatedFields: Partial<InventoryItem>) => void;
  onDeleteItem: (id: string) => void;
  onDeleteMultiple: (ids: string[]) => void;
  onEditClick: (item: InventoryItem) => void;
  onViewPhoto: (photoUrl: string, item: InventoryItem) => void;
}

export const SpreadsheetTable: React.FC<SpreadsheetTableProps> = ({
  items,
  onUpdateItem,
  onDeleteItem,
  onDeleteMultiple,
  onEditClick,
  onViewPhoto,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('ALL');
  const [selectedDistributor, setSelectedDistributor] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortField, setSortField] = useState<keyof InventoryItem>('dateAdded');
  const [sortAsc, setSortAsc] = useState(false);

  // Inline cell editing state: { itemId, field }
  const [editingCell, setEditingCell] = useState<{ id: string; field: keyof InventoryItem } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [bulkCopied, setBulkCopied] = useState(false);

  // Extract unique brands, distributors, categories for filters
  const uniqueBrands = useMemo(() => {
    return Array.from(new Set(items.map((i) => i.brand).filter(Boolean))).sort();
  }, [items]);

  const uniqueDistributors = useMemo(() => {
    return Array.from(new Set(items.map((i) => i.distributor).filter(Boolean))).sort();
  }, [items]);

  const uniqueCategories = useMemo(() => {
    return Array.from(new Set(items.map((i) => i.category).filter(Boolean))).sort();
  }, [items]);

  // Compute duplicate serial numbers map
  const duplicateSerialsMap = useMemo(() => {
    const counts = new Map<string, number>();
    items.forEach((item) => {
      if (item.serialNumber && item.serialNumber !== '-' && item.serialNumber !== 'N/A') {
        const norm = item.serialNumber.trim().toUpperCase();
        counts.set(norm, (counts.get(norm) || 0) + 1);
      }
    });
    return counts;
  }, [items]);

  // Filter and sort items
  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        // Search across all text fields
        const query = searchTerm.toLowerCase();
        const matchesSearch =
          !query ||
          item.serialNumber?.toLowerCase().includes(query) ||
          item.brand?.toLowerCase().includes(query) ||
          item.type?.toLowerCase().includes(query) ||
          item.distributor?.toLowerCase().includes(query) ||
          item.itemName?.toLowerCase().includes(query) ||
          item.notes?.toLowerCase().includes(query);

        const matchesBrand = selectedBrand === 'ALL' || item.brand === selectedBrand;
        const matchesDistributor = selectedDistributor === 'ALL' || item.distributor === selectedDistributor;
        const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
        const matchesStatus = selectedStatus === 'ALL' || item.status === selectedStatus;

        return matchesSearch && matchesBrand && matchesDistributor && matchesCategory && matchesStatus;
      })
      .sort((a, b) => {
        let valA = a[sortField] || '';
        let valB = b[sortField] || '';
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();

        if (valA < valB) return sortAsc ? -1 : 1;
        if (valA > valB) return sortAsc ? 1 : -1;
        return 0;
      });
  }, [items, searchTerm, selectedBrand, selectedDistributor, selectedCategory, selectedStatus, sortField, sortAsc]);

  // Selection handlers
  const handleSelectAll = () => {
    if (selectedIds.length === filteredItems.length && filteredItems.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredItems.map((i) => i.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Sorting handler
  const handleSort = (field: keyof InventoryItem) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  // Inline editing handlers
  const startEditing = (item: InventoryItem, field: keyof InventoryItem) => {
    setEditingCell({ id: item.id, field });
    setEditValue(String(item[field] || ''));
  };

  const saveInlineEdit = () => {
    if (!editingCell) return;
    onUpdateItem(editingCell.id, { [editingCell.field]: editValue });
    setEditingCell(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveInlineEdit();
    } else if (e.key === 'Escape') {
      setEditingCell(null);
    }
  };

  // Bulk actions
  const selectedItemsData = useMemo(() => {
    return items.filter((i) => selectedIds.includes(i.id));
  }, [items, selectedIds]);

  const handleExportSelectedExcel = () => {
    exportToExcel(selectedItemsData, `Rekap_Pilihan_${selectedItemsData.length}_Barang.xlsx`);
  };

  const handleCopySelectedSheets = async () => {
    const ok = await copyForGoogleSheets(selectedItemsData);
    if (ok) {
      setBulkCopied(true);
      setTimeout(() => setBulkCopied(false), 2500);
    }
  };

  const handleBulkStatusChange = (newStatus: InventoryItem['status']) => {
    selectedIds.forEach((id) => {
      onUpdateItem(id, { status: newStatus });
    });
  };

  const handleBulkDelete = () => {
    if (confirm(`Yakin ingin menghapus ${selectedIds.length} baris barang dari rekap?`)) {
      onDeleteMultiple(selectedIds);
      setSelectedIds([]);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
      
      {/* Top Filter and Search Bar */}
      <div className="p-4 border-b border-slate-200/80 bg-slate-50/70 flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari No Seri, Merk, Type, Distributor, Nama..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 bg-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 shadow-2xs font-medium"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filters Grid */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Merk Filter */}
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 shadow-2xs"
          >
            <option value="ALL">Semua Merk ({uniqueBrands.length})</option>
            {uniqueBrands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>

          {/* Distributor Filter */}
          <select
            value={selectedDistributor}
            onChange={(e) => setSelectedDistributor(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 shadow-2xs max-w-[180px] truncate"
          >
            <option value="ALL">Semua Distributor ({uniqueDistributors.length})</option>
            {uniqueDistributors.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 shadow-2xs"
          >
            <option value="ALL">Semua Status</option>
            <option value="Diverifikasi">Diverifikasi</option>
            <option value="Menunggu Cek">Menunggu Cek</option>
            <option value="Masuk Gudang">Masuk Gudang</option>
            <option value="Retur/Rusak">Retur/Rusak</option>
          </select>

          {(searchTerm || selectedBrand !== 'ALL' || selectedDistributor !== 'ALL' || selectedStatus !== 'ALL') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedBrand('ALL');
                setSelectedDistributor('ALL');
                setSelectedStatus('ALL');
              }}
              className="text-xs text-blue-600 font-bold hover:underline px-1 cursor-pointer"
            >
              Reset Filter
            </button>
          )}
        </div>

      </div>

      {/* Bulk Selection Action Toolbar (Active when rows are selected) */}
      {selectedIds.length > 0 && (
        <div className="bg-blue-50/90 border-b border-blue-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 font-bold text-blue-900">
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
              {selectedIds.length}
            </span>
            <span>Baris Dipilih dari Rekap</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportSelectedExcel}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-emerald-300 text-emerald-800 font-semibold hover:bg-emerald-50 shadow-2xs cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Ekspor Excel ({selectedIds.length})</span>
            </button>

            <button
              onClick={handleCopySelectedSheets}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-blue-300 text-blue-800 font-semibold hover:bg-blue-50 shadow-2xs cursor-pointer"
            >
              {bulkCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-blue-600" />}
              <span>{bulkCopied ? 'Tersalin!' : 'Salin untuk Sheet'}</span>
            </button>

            <div className="h-4 w-px bg-blue-300" />

            <div className="flex items-center gap-1 text-[11px] font-medium text-slate-600">
              <span>Ubah Status:</span>
              <button
                onClick={() => handleBulkStatusChange('Diverifikasi')}
                className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 hover:bg-emerald-200 font-semibold cursor-pointer"
              >
                Diverifikasi
              </button>
              <button
                onClick={() => handleBulkStatusChange('Masuk Gudang')}
                className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 hover:bg-blue-200 font-semibold cursor-pointer"
              >
                Gudang
              </button>
            </div>

            <button
              onClick={handleBulkDelete}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 font-semibold cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus ({selectedIds.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* Spreadsheet Table Viewport */}
      <div className="overflow-x-auto min-h-[300px]">
        <table className="w-full text-left border-collapse text-xs">
          {/* Table Headers */}
          <thead>
            <tr className="bg-slate-100/90 border-b border-slate-200 text-slate-700 font-bold select-none text-[11px] uppercase tracking-wider sticky top-0 z-10">
              
              {/* Checkbox select all */}
              <th className="py-3 px-3 w-10 text-center">
                <button
                  onClick={handleSelectAll}
                  className="cursor-pointer text-slate-500 hover:text-blue-600 flex items-center justify-center mx-auto"
                >
                  {selectedIds.length === filteredItems.length && filteredItems.length > 0 ? (
                    <CheckSquare className="w-4 h-4 text-blue-600" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </button>
              </th>

              <th className="py-3 px-2 w-10 text-center font-mono text-slate-500">
                #
              </th>

              {/* No Seri */}
              <th
                onClick={() => handleSort('serialNumber')}
                className="py-3 px-3 min-w-[170px] cursor-pointer hover:bg-slate-200/60 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>No Seri (SN)</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              {/* Merk */}
              <th
                onClick={() => handleSort('brand')}
                className="py-3 px-3 min-w-[120px] cursor-pointer hover:bg-slate-200/60 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Merk</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              {/* Type / Model */}
              <th
                onClick={() => handleSort('type')}
                className="py-3 px-3 min-w-[170px] cursor-pointer hover:bg-slate-200/60 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Type / Model</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              {/* Distributor */}
              <th
                onClick={() => handleSort('distributor')}
                className="py-3 px-3 min-w-[210px] cursor-pointer hover:bg-slate-200/60 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Distributor</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              {/* Nama Barang */}
              <th
                onClick={() => handleSort('itemName')}
                className="py-3 px-3 min-w-[200px] cursor-pointer hover:bg-slate-200/60 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Nama Barang</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              {/* Kategori */}
              <th
                onClick={() => handleSort('category')}
                className="py-3 px-3 min-w-[130px] cursor-pointer hover:bg-slate-200/60 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Kategori</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              {/* Tanggal Input */}
              <th
                onClick={() => handleSort('dateAdded')}
                className="py-3 px-3 min-w-[130px] cursor-pointer hover:bg-slate-200/60 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Waktu Input</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              {/* Status */}
              <th className="py-3 px-3 min-w-[120px]">
                Status
              </th>

              {/* Foto Label */}
              <th className="py-3 px-2 w-14 text-center">
                Foto
              </th>

              {/* Aksi */}
              <th className="py-3 px-3 w-20 text-center sticky right-0 bg-slate-100 z-10 border-l border-slate-200">
                Aksi
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-200/70">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={12} className="py-12 text-center text-slate-400">
                  <div className="max-w-xs mx-auto space-y-2">
                    <p className="font-semibold text-sm text-slate-600">
                      Tidak ada data barang yang cocok
                    </p>
                    <p className="text-xs text-slate-400">
                      Gunakan tombol "Scan Kamera Langsung" atau "Unggah Foto" untuk merekap barang otomatis melalui OCR.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredItems.map((item, index) => {
                const isSelected = selectedIds.includes(item.id);
                const normSerial = item.serialNumber?.trim().toUpperCase();
                const isDuplicate = normSerial && (duplicateSerialsMap.get(normSerial) || 0) > 1;

                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-blue-50/30 transition-colors group ${
                      isSelected ? 'bg-blue-50/50' : index % 2 === 1 ? 'bg-slate-50/40' : 'bg-white'
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => toggleSelectOne(item.id)}
                        className="cursor-pointer text-slate-400 hover:text-blue-600 flex items-center justify-center mx-auto"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-blue-600" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </td>

                    {/* Row Index */}
                    <td className="py-2.5 px-2 text-center font-mono text-slate-400 text-[11px]">
                      {index + 1}
                    </td>

                    {/* No Seri (Editable cell with duplicate badge) */}
                    <td
                      className="py-2 px-3 font-mono font-bold text-slate-900 cursor-pointer relative"
                      onDoubleClick={() => startEditing(item, 'serialNumber')}
                    >
                      {editingCell?.id === item.id && editingCell.field === 'serialNumber' ? (
                        <input
                          autoFocus
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={saveInlineEdit}
                          onKeyDown={handleKeyDown}
                          className="w-full px-2 py-1 text-xs font-mono font-bold border border-blue-500 rounded bg-white shadow-xs focus:outline-hidden"
                        />
                      ) : (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={isDuplicate ? 'text-amber-700 bg-amber-50 px-1 rounded' : 'text-slate-900'}
                            title="Klik ganda untuk mengedit langsung"
                          >
                            {item.serialNumber || '-'}
                          </span>
                          {isDuplicate && (
                            <span
                              title="Nomor Seri ini terdeteksi lebih dari satu kali di rekap"
                              className="inline-flex items-center text-[10px] text-amber-800 bg-amber-100 font-sans font-bold px-1.5 py-0.2 rounded-full border border-amber-300"
                            >
                              <AlertTriangle className="w-2.5 h-2.5 mr-0.5 text-amber-600" />
                              Duplikat
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Merk (Editable cell) */}
                    <td
                      className="py-2 px-3 cursor-pointer"
                      onDoubleClick={() => startEditing(item, 'brand')}
                    >
                      {editingCell?.id === item.id && editingCell.field === 'brand' ? (
                        <input
                          autoFocus
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={saveInlineEdit}
                          onKeyDown={handleKeyDown}
                          className="w-full px-2 py-1 text-xs font-semibold border border-blue-500 rounded bg-white shadow-xs focus:outline-hidden"
                        />
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 font-bold text-slate-800 border border-slate-200/80">
                          {item.brand || '-'}
                        </span>
                      )}
                    </td>

                    {/* Type / Model (Editable cell) */}
                    <td
                      className="py-2 px-3 font-semibold text-slate-800 cursor-pointer"
                      onDoubleClick={() => startEditing(item, 'type')}
                    >
                      {editingCell?.id === item.id && editingCell.field === 'type' ? (
                        <input
                          autoFocus
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={saveInlineEdit}
                          onKeyDown={handleKeyDown}
                          className="w-full px-2 py-1 text-xs font-semibold border border-blue-500 rounded bg-white shadow-xs focus:outline-hidden"
                        />
                      ) : (
                        <span title="Klik ganda untuk edit langsung">{item.type || '-'}</span>
                      )}
                    </td>

                    {/* Distributor (Editable cell) */}
                    <td
                      className="py-2 px-3 font-medium text-slate-700 cursor-pointer"
                      onDoubleClick={() => startEditing(item, 'distributor')}
                    >
                      {editingCell?.id === item.id && editingCell.field === 'distributor' ? (
                        <input
                          autoFocus
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={saveInlineEdit}
                          onKeyDown={handleKeyDown}
                          className="w-full px-2 py-1 text-xs font-medium border border-blue-500 rounded bg-white shadow-xs focus:outline-hidden"
                        />
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0" />
                          <span className="truncate max-w-[200px]" title={item.distributor}>
                            {item.distributor || '-'}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Nama Barang */}
                    <td
                      className="py-2 px-3 text-slate-600 cursor-pointer"
                      onDoubleClick={() => startEditing(item, 'itemName')}
                    >
                      {editingCell?.id === item.id && editingCell.field === 'itemName' ? (
                        <input
                          autoFocus
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={saveInlineEdit}
                          onKeyDown={handleKeyDown}
                          className="w-full px-2 py-1 text-xs border border-blue-500 rounded bg-white shadow-xs focus:outline-hidden"
                        />
                      ) : (
                        <span className="truncate max-w-[190px] block" title={item.itemName}>
                          {item.itemName || '-'}
                        </span>
                      )}
                    </td>

                    {/* Kategori */}
                    <td className="py-2 px-3 text-slate-500">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[11px] font-medium text-slate-600">
                        {item.category || 'Umum'}
                      </span>
                    </td>

                    {/* Tanggal Input */}
                    <td className="py-2 px-3 text-slate-500 font-mono text-[11px]">
                      {item.dateAdded}
                    </td>

                    {/* Status Badge */}
                    <td className="py-2 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.status === 'Diverifikasi'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.status === 'Masuk Gudang'
                            ? 'bg-blue-100 text-blue-800'
                            : item.status === 'Retur/Rusak'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {item.status === 'Diverifikasi' && <CheckCircle className="w-2.5 h-2.5" />}
                        {item.status === 'Menunggu Cek' && <Clock className="w-2.5 h-2.5" />}
                        {item.status}
                      </span>
                    </td>

                    {/* Foto Label Thumbnail */}
                    <td className="py-2 px-2 text-center">
                      {item.photoUrl ? (
                        <button
                          onClick={() => onViewPhoto(item.photoUrl!, item)}
                          className="w-7 h-7 rounded-md overflow-hidden border border-slate-300 hover:border-blue-500 hover:scale-110 transition-all inline-block cursor-pointer bg-slate-100"
                          title="Lihat foto label asli"
                        >
                          <img
                            src={item.photoUrl}
                            alt="Label"
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ) : (
                        <span className="text-slate-300 text-[10px]">-</span>
                      )}
                    </td>

                    {/* Aksi Buttons */}
                    <td className="py-2 px-3 text-center sticky right-0 bg-white group-hover:bg-blue-50/30 z-10 border-l border-slate-200">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onEditClick(item)}
                          title="Edit baris ini"
                          className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(`Hapus barang No Seri ${item.serialNumber}?`)) {
                              onDeleteItem(item.id);
                            }
                          }}
                          title="Hapus baris ini"
                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Spreadsheet Bottom Stats & Tips Footer */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700">
            Menampilkan {filteredItems.length} dari {items.length} total baris inventaris
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-[11px] text-slate-500">
            Tip: Klik ganda (double-click) sel apapun untuk mengedit langsung seperti di Excel!
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => exportToExcel(filteredItems, 'Rekap_Barang_SmartRekap.xlsx')}
            className="text-emerald-700 hover:text-emerald-900 font-bold inline-flex items-center gap-1 cursor-pointer"
          >
            <Download className="w-3 h-3" />
            <span>Unduh Excel Tabel Ini</span>
          </button>
        </div>
      </div>

    </div>
  );
};
