import * as XLSX from 'xlsx';
import { InventoryItem } from '../types/inventory';

export function formatInventoryForExport(items: InventoryItem[]) {
  return items.map((item, index) => ({
    'No': index + 1,
    'Tanggal Input': item.dateAdded,
    'No Seri': item.serialNumber,
    'Merk': item.brand,
    'Type': item.type,
    'Distributor': item.distributor,
    'Nama Barang': item.itemName,
    'Kategori': item.category,
    'Status': item.status,
    'Catatan': item.notes || '-',
  }));
}

/**
 * Ekspor ke file Microsoft Excel (.xlsx) dengan kolom rapi
 */
export function exportToExcel(items: InventoryItem[], filename = 'Rekap_Barang_SmartRekap.xlsx') {
  if (!items || items.length === 0) return;

  const data = formatInventoryForExport(items);
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Set explicit column widths for clean spreadsheet layout
  worksheet['!cols'] = [
    { wch: 6 },  // No
    { wch: 18 }, // Tanggal
    { wch: 22 }, // No Seri
    { wch: 16 }, // Merk
    { wch: 20 }, // Type
    { wch: 28 }, // Distributor
    { wch: 28 }, // Nama Barang
    { wch: 18 }, // Kategori
    { wch: 15 }, // Status
    { wch: 30 }, // Catatan
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Rekap Inventaris');

  // Download XLSX
  XLSX.writeFile(workbook, filename);
}

/**
 * Ekspor ke file CSV dengan UTF-8 BOM untuk kompatibilitas penuh Excel & Google Sheets
 */
export function exportToCSV(items: InventoryItem[], filename = 'Rekap_Barang_SmartRekap.csv') {
  if (!items || items.length === 0) return;

  const headers = ['No', 'Tanggal Input', 'No Seri', 'Merk', 'Type', 'Distributor', 'Nama Barang', 'Kategori', 'Status', 'Catatan'];
  
  const rows = items.map((item, index) => [
    index + 1,
    item.dateAdded,
    item.serialNumber,
    item.brand,
    item.type,
    item.distributor,
    item.itemName,
    item.category,
    item.status,
    (item.notes || '-').replace(/"/g, '""'),
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
  ].join('\r\n');

  // Add UTF-8 BOM (\uFEFF)
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Salin data dengan format Tab-Separated Values (TSV)
 * Langsung pas bila di-paste (Ctrl + V) ke Google Spreadsheet atau Microsoft Excel
 */
export async function copyForGoogleSheets(items: InventoryItem[]): Promise<boolean> {
  if (!items || items.length === 0) return false;

  const headers = ['No', 'Tanggal Input', 'No Seri', 'Merk', 'Type', 'Distributor', 'Nama Barang', 'Kategori', 'Status', 'Catatan'];
  
  const rows = items.map((item, index) => [
    index + 1,
    item.dateAdded,
    item.serialNumber,
    item.brand,
    item.type,
    item.distributor,
    item.itemName,
    item.category,
    item.status,
    item.notes || '-',
  ]);

  const tsvContent = [
    headers.join('\t'),
    ...rows.map(r => r.join('\t')),
  ].join('\n');

  try {
    await navigator.clipboard.writeText(tsvContent);
    return true;
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    return false;
  }
}
