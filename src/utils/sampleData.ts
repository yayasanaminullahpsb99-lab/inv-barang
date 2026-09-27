import { InventoryItem } from '../types/inventory';

export const INITIAL_INVENTORY_ITEMS: InventoryItem[] = [
  {
    id: 'inv-101',
    serialNumber: 'SN-EPS-982341-ID',
    brand: 'Epson',
    type: 'EcoTank L3210 All-in-One',
    distributor: 'PT Datascrip Indonesia',
    itemName: 'Printer Ink Tank Multifungsi Epson L3210',
    category: 'Komputer & IT',
    dateAdded: '2026-09-26 14:20',
    status: 'Diverifikasi',
    notes: 'Garansi resmi 2 tahun, Made in Philippines, AC 220-240V',
    confidence: 'Tinggi',
    rawText: 'EPSON ECOTANK L3210 | S/N: SN-EPS-982341-ID | DIST: PT DATASCRIP INDONESIA',
  },
  {
    id: 'inv-102',
    serialNumber: 'SN-ASUS-883920-VN',
    brand: 'Asus',
    type: 'Vivobook 14 A1404VA-IPS351',
    distributor: 'PT Synnex Metrodata Indonesia',
    itemName: 'Laptop Asus Vivobook 14 Core i3 8GB 512GB',
    category: 'Komputer & IT',
    dateAdded: '2026-09-26 15:10',
    status: 'Masuk Gudang',
    notes: 'Segel utuh, Dus original, Adaptor 45W included',
    confidence: 'Tinggi',
    rawText: 'ASUSTeK COMPUTER INC. | MODEL: A1404VA | SERIAL NO: SN-ASUS-883920-VN | IMPORTIR: PT SYNNEX METRODATA INDONESIA',
  },
  {
    id: 'inv-103',
    serialNumber: 'SN-DKN-551029-TH',
    brand: 'Daikin',
    type: 'FTKQ25UVM4 Flash Inverter 1 PK',
    distributor: 'PT Daikin Airconditioning Indonesia',
    itemName: 'AC Split Daikin Flash Inverter 1 PK R32',
    category: 'Elektronik & Pendingin',
    dateAdded: '2026-09-26 16:45',
    status: 'Diverifikasi',
    notes: 'Freon R32, 680 Watt, Made in Thailand',
    confidence: 'Tinggi',
    rawText: 'DAIKIN INDUSTRIES (THAILAND) | MODEL FTKQ25UVM4 | S/N: SN-DKN-551029-TH | DIST: PT DAIKIN AIRCONDITIONING INDONESIA',
  },
  {
    id: 'inv-104',
    serialNumber: 'SN-SMG-439012-KR',
    brand: 'Samsung',
    type: 'Crystal UHD 4K Smart TV 43 Inch CU7000',
    distributor: 'PT Samsung Electronics Indonesia',
    itemName: 'Smart TV Samsung 43" 4K UHD UA43CU7000',
    category: 'Elektronik & Hiburan',
    dateAdded: '2026-09-27 09:15',
    status: 'Diverifikasi',
    notes: 'Tizen OS, HDMI x3, USB x1, DVB-T2',
    confidence: 'Tinggi',
    rawText: 'SAMSUNG ELECTRONICS INDONESIA | MODEL CODE: UA43CU7000KXXD | SERIAL NO: SN-SMG-439012-KR',
  },
  {
    id: 'inv-105',
    serialNumber: 'SN-PLP-112093-MY',
    brand: 'Philips',
    type: 'Air Fryer HD9200/90 Series 1000',
    distributor: 'PT Bintang Distribusi Megah',
    itemName: 'Philips Essential Air Fryer 4.1 Liter',
    category: 'Alat Rumah Tangga',
    dateAdded: '2026-09-27 10:00',
    status: 'Menunggu Cek',
    notes: '1400 Watt, Rapid Air Technology, Black Matte',
    confidence: 'Sedang',
    rawText: 'PHILIPS APPLIANCES | TYPE: HD9200/90 | S/N: SN-PLP-112093-MY | DIST: PT BINTANG DISTRIBUSI MEGAH',
  },
];

/**
 * Creates a synthetic realistic product barcode sticker image (SVG Data URL)
 * for testing the OCR without needing a physical product.
 */
export function generateSyntheticLabelDataUrl(labelInfo: {
  brand: string;
  type: string;
  serialNumber: string;
  distributor: string;
  category: string;
  spec: string;
  barcodeNumber: string;
}): string {
  // SVG drawing of realistic warehouse product label with barcode lines
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="600" height="380" viewBox="0 0 600 380" style="background:#ffffff; font-family:Arial, sans-serif;">
    <rect x="8" y="8" width="584" height="364" rx="10" fill="#ffffff" stroke="#1e293b" stroke-width="3" stroke-dasharray="0"/>
    
    <!-- Top header band -->
    <rect x="8" y="8" width="584" height="54" rx="8" fill="#0f172a" />
    <text x="24" y="42" fill="#ffffff" font-size="20" font-weight="bold" letter-spacing="1.5">LABEL IDENTIFIKASI &amp; GARANSI RESMI</text>
    <rect x="470" y="20" width="105" height="30" rx="4" fill="#38bdf8" />
    <text x="480" y="40" fill="#0f172a" font-size="12" font-weight="bold">QC PASSED</text>
    
    <!-- Brand & Type -->
    <text x="24" y="95" fill="#64748b" font-size="12" font-weight="bold">MERK / BRAND</text>
    <text x="24" y="125" fill="#0284c7" font-size="26" font-weight="bold">${labelInfo.brand.toUpperCase()}</text>
    
    <text x="280" y="95" fill="#64748b" font-size="12" font-weight="bold">TYPE / MODEL</text>
    <text x="280" y="125" fill="#0f172a" font-size="20" font-weight="bold">${labelInfo.type}</text>

    <!-- Divider line -->
    <line x1="20" y1="145" x2="580" y2="145" stroke="#cbd5e1" stroke-width="2" />

    <!-- Barcode simulation -->
    <g transform="translate(30, 160)">
      <!-- Simulated barcode stripes -->
      <rect x="0" y="0" width="4" height="65" fill="#0f172a" />
      <rect x="8" y="0" width="2" height="65" fill="#0f172a" />
      <rect x="14" y="0" width="6" height="65" fill="#0f172a" />
      <rect x="24" y="0" width="3" height="65" fill="#0f172a" />
      <rect x="30" y="0" width="2" height="65" fill="#0f172a" />
      <rect x="36" y="0" width="8" height="65" fill="#0f172a" />
      <rect x="48" y="0" width="3" height="65" fill="#0f172a" />
      <rect x="56" y="0" width="5" height="65" fill="#0f172a" />
      <rect x="65" y="0" width="2" height="65" fill="#0f172a" />
      <rect x="72" y="0" width="7" height="65" fill="#0f172a" />
      <rect x="83" y="0" width="3" height="65" fill="#0f172a" />
      <rect x="90" y="0" width="5" height="65" fill="#0f172a" />
      <rect x="100" y="0" width="2" height="65" fill="#0f172a" />
      <rect x="106" y="0" width="8" height="65" fill="#0f172a" />
      <rect x="118" y="0" width="4" height="65" fill="#0f172a" />
      <rect x="126" y="0" width="2" height="65" fill="#0f172a" />
      <rect x="132" y="0" width="6" height="65" fill="#0f172a" />
      <rect x="142" y="0" width="3" height="65" fill="#0f172a" />
      <rect x="149" y="0" width="5" height="65" fill="#0f172a" />
      <rect x="158" y="0" width="2" height="65" fill="#0f172a" />
      <rect x="164" y="0" width="6" height="65" fill="#0f172a" />
      <rect x="174" y="0" width="4" height="65" fill="#0f172a" />
      <rect x="182" y="0" width="8" height="65" fill="#0f172a" />
      <rect x="194" y="0" width="2" height="65" fill="#0f172a" />
      <rect x="200" y="0" width="4" height="65" fill="#0f172a" />
      <text x="25" y="80" fill="#0f172a" font-size="13" font-family="Courier, monospace" font-weight="bold">${labelInfo.barcodeNumber}</text>
    </g>

    <!-- Serial Number Box -->
    <rect x="270" y="155" width="305" height="75" rx="6" fill="#f1f5f9" stroke="#94a3b8" stroke-width="1.5" />
    <text x="282" y="177" fill="#475569" font-size="11" font-weight="bold">SERIAL NUMBER (NO. SERI):</text>
    <text x="282" y="208" fill="#b91c1c" font-size="21" font-weight="bold" font-family="Courier, monospace" letter-spacing="1">${labelInfo.serialNumber}</text>

    <!-- Divider line -->
    <line x1="20" y1="245" x2="580" y2="245" stroke="#cbd5e1" stroke-width="1.5" />

    <!-- Distributor & Specs -->
    <text x="24" y="270" fill="#64748b" font-size="11" font-weight="bold">DISTRIBUTOR / IMPORTIR RESMI:</text>
    <text x="24" y="295" fill="#0f172a" font-size="15" font-weight="bold">${labelInfo.distributor}</text>

    <text x="24" y="325" fill="#64748b" font-size="11" font-weight="bold">SPESIFIKASI &amp; KATEGORI:</text>
    <text x="24" y="348" fill="#334155" font-size="13">${labelInfo.category} | ${labelInfo.spec}</text>

    <!-- Security hologram badge simulation -->
    <g transform="translate(460, 260)">
      <circle cx="50" cy="45" r="38" fill="#fde047" stroke="#eab308" stroke-width="3" />
      <text x="25" y="42" fill="#854d0e" font-size="10" font-weight="bold">AUTHENTIC</text>
      <text x="26" y="55" fill="#854d0e" font-size="9" font-weight="bold">ORIGINAL</text>
    </g>
  </svg>
  `;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const SAMPLE_LABEL_PRESETS = [
  {
    title: 'Label Printer Epson L3210',
    description: 'Label resmi Epson dengan S/N & Distributor Datascrip',
    data: {
      brand: 'Epson',
      type: 'EcoTank L3210 All-in-One',
      serialNumber: 'SN-EPS-991204-ID',
      distributor: 'PT Datascrip Indonesia',
      category: 'Komputer & IT',
      spec: 'Multi-function Ink Tank, 220V 50Hz, Made in PH',
      barcodeNumber: '8991230491024',
    },
  },
  {
    title: 'Nameplate AC Daikin Flash Inverter',
    description: 'Label outdoor/indoor Daikin dengan S/N & Distributor resmi Daikin',
    data: {
      brand: 'Daikin',
      type: 'FTKQ35UVM4 Inverter 1.5 PK',
      serialNumber: 'SN-DKN-773190-TH',
      distributor: 'PT Daikin Airconditioning Indonesia',
      category: 'Elektronik & Pendingin',
      spec: 'Cap 12000 BTU, Refrigerant R32, 950W',
      barcodeNumber: '8850123984102',
    },
  },
  {
    title: 'Label Stiker Laptop Asus ROG/Vivobook',
    description: 'Stiker kardus Asus dengan S/N & Distributor Synnex Metrodata',
    data: {
      brand: 'Asus',
      type: 'Vivobook 15 X1502ZA Core i5',
      serialNumber: 'SN-ASUS-994123-TW',
      distributor: 'PT Synnex Metrodata Indonesia',
      category: 'Komputer & IT',
      spec: 'RAM 16GB, SSD 512GB, 19.5V 3.33A 65W',
      barcodeNumber: '4711081983021',
    },
  },
  {
    title: 'Surat Jalan / Kardus Samsung TV',
    description: 'Label kemasan Samsung 50 Inch Crystal 4K UHD',
    data: {
      brand: 'Samsung',
      type: 'UHD 4K TV 50" UA50DU7000',
      serialNumber: 'SN-SMG-662301-VN',
      distributor: 'PT Samsung Electronics Indonesia',
      category: 'Elektronik & Hiburan',
      spec: 'LED Backlight, AC 100-240V, Smart Hub',
      barcodeNumber: '8806091239401',
    },
  },
  {
    title: 'Stiker Sparepart Honda Genuine Part',
    description: 'Label suku cadang resmi AHM dengan No Seri & Distributor',
    data: {
      brand: 'Honda Genuine Parts',
      type: 'Drive Belt V-Belt K44-V01',
      serialNumber: 'SN-HGP-440192-JKT',
      distributor: 'PT Astra Honda Motor',
      category: 'Otomotif & Sparepart',
      spec: 'Original Part for BeAT/Vario/Scoopy ESP',
      barcodeNumber: '8994567812903',
    },
  },
];
