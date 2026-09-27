export interface InventoryItem {
  id: string;
  serialNumber: string;
  brand: string;
  type: string;
  distributor: string;
  itemName: string;
  category: string;
  dateAdded: string; // YYYY-MM-DD HH:mm
  status: 'Diverifikasi' | 'Menunggu Cek' | 'Masuk Gudang' | 'Retur/Rusak';
  notes?: string;
  photoUrl?: string;
  confidence?: 'Tinggi' | 'Sedang' | 'Rendah';
  rawText?: string;
}

export interface OCRScanResultItem {
  serialNumber: string;
  brand: string;
  type: string;
  distributor: string;
  itemName: string;
  category: string;
  confidence: 'Tinggi' | 'Sedang' | 'Rendah';
  notes?: string;
  rawText?: string;
}

export interface OCRScanResponse {
  success: boolean;
  summaryMessage: string;
  items: OCRScanResultItem[];
}

export interface GoogleSheetsConfig {
  webhookUrl: string;
  spreadsheetName?: string;
  autoSync: boolean;
  lastSyncTime?: string;
}
