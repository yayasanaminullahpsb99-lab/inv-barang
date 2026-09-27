import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Set payload limit up to 50mb for high-res camera photos
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Initialize Gemini AI Client
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      hasApiKey: Boolean(process.env.GEMINI_API_KEY),
      timestamp: new Date().toISOString(),
    });
  });

  // OCR Processing Endpoint
  app.post('/api/ocr-scan', async (req, res) => {
    try {
      const { imageBase64, mimeType = 'image/jpeg', defaultDistributor = '', hints = '' } = req.body;

      if (!imageBase64) {
        return res.status(400).json({ error: 'Data gambar (base64) wajib disertakan.' });
      }

      // Clean base64 prefix if present (e.g., data:image/jpeg;base64,...)
      const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');

      const systemInstruction = `Anda adalah asisten OCR dan data entry gudang/logistik profesional berstandar tinggi.
Tugas Anda adalah membaca gambar foto (label barcode, nameplate barang, kardus kemasan, stiker spesifikasi, faktur/surat jalan pengiriman) dan mengekstrak data inventaris secara akurat sesuai format:
1. No Seri (Serial Number / S/N / SN / Barcode string / IMEI)
2. Merk (Brand / Produsen)
3. Type (Model / Tipe / Varian produk)
4. Distributor (Pemasok / Supplier / Vendor / Pengirim / Penerbit dokumen)
5. Nama Barang (Deskripsi produk yang jelas dan representatif)
6. Kategori (Kategori umum barang, contoh: Elektronik, Komputer & IT, Alat Rumah Tangga, Sparepart, Mesin & Tools, dsb.)
7. Confidence (Tingkat keyakinan OCR: "Tinggi", "Sedang", "Rendah")
8. RawText (Kutipan teks penting yang terbaca pada label untuk verifikasi pengguna)
9. Notes (Spesifikasi penting seperti voltase, daya, made in, atau tahun produksi bila ada)

Aturan:
- Cari nomor seri secara teliti. Seringkali diawali teks S/N:, SN, Serial No, No. Seri, atau di bawah barcode. Bersihkan spasi atau karakter liar yang bukan bagian dari nomor seri.
- Identifikasi Merk dengan akurat (contoh: Samsung, Daikin, Philips, Epson, Asus, LG, Polytron, Canon, Lenovo, Honda, dll).
- Identifikasi Type / Model secara spesifik (contoh: EcoTank L3210, Vivobook 14 A1404, RT28K, STC25NV, dsb).
- Jika ada teks distributor atau surat jalan pada foto (contoh: PT Synnex Metrodata, PT Datascrip, CV Sumber Jaya, dsb), gunakan itu. Jika di label stiker tidak tertulis nama distributor, gunakan default distributor jika diberikan oleh pengguna: "${defaultDistributor || 'Distributor Umum'}".
- Jika terdapat beberapa barang dalam 1 foto (misalnya lembar surat jalan atau beberapa stiker), ekstrak semua barang ke dalam array. Jika hanya 1 barang, kembalikan array berisi 1 item.
- Berikan hasil dalam format JSON murni sesuai skema.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType,
                data: cleanBase64,
              },
            },
            {
              text: `Analisis foto ini dan lakukan OCR ekstraksi data barang inventaris.
Petunjuk tambahan dari pengguna: ${hints || 'Tidak ada petunjuk khusus. Ekstrak No Seri, Merk, Type, dan Distributor seakurat mungkin.'}
Default distributor bila tidak tercantum di foto: "${defaultDistributor}"`,
            },
          ],
        },
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              success: {
                type: Type.BOOLEAN,
                description: 'Apakah OCR berhasil membaca setidaknya satu data barang',
              },
              summaryMessage: {
                type: Type.STRING,
                description: 'Ringkasan singkat hasil deteksi OCR dalam bahasa Indonesia',
              },
              items: {
                type: Type.ARRAY,
                description: 'Daftar item barang yang berhasil diekstrak dari foto',
                items: {
                  type: Type.OBJECT,
                  properties: {
                    serialNumber: {
                      type: Type.STRING,
                      description: 'Nomor Seri / SN produk yang tertera pada stiker atau barcode',
                    },
                    brand: {
                      type: Type.STRING,
                      description: 'Merk produk (Brand)',
                    },
                    type: {
                      type: Type.STRING,
                      description: 'Type / Model produk',
                    },
                    distributor: {
                      type: Type.STRING,
                      description: 'Distributor atau supplier resmi',
                    },
                    itemName: {
                      type: Type.STRING,
                      description: 'Nama barang / deskripsi produk',
                    },
                    category: {
                      type: Type.STRING,
                      description: 'Kategori barang (contoh: Elektronik, Komputer & IT, Alat Rumah Tangga, dsb)',
                    },
                    confidence: {
                      type: Type.STRING,
                      description: 'Tinggi, Sedang, atau Rendah',
                    },
                    notes: {
                      type: Type.STRING,
                      description: 'Catatan tambahan seperti daya, voltase, negara pembuat, dll',
                    },
                    rawText: {
                      type: Type.STRING,
                      description: 'Teks mentah yang dibaca oleh OCR',
                    },
                  },
                  required: ['serialNumber', 'brand', 'type', 'distributor', 'itemName'],
                },
              },
            },
            required: ['success', 'items', 'summaryMessage'],
          },
        },
      });

      const responseText = response.text || '{}';
      const parsedData = JSON.parse(responseText);

      return res.json({
        ok: true,
        data: parsedData,
      });
    } catch (error: any) {
      console.error('Error during OCR processing:', error);
      return res.status(500).json({
        ok: false,
        error: error?.message || 'Gagal memproses OCR pada foto barang.',
      });
    }
  });

  // Webhook proxy to forward data directly to Google Sheets Web App if configured
  app.post('/api/sync-google-sheets', async (req, res) => {
    try {
      const { webhookUrl, items } = req.body;

      if (!webhookUrl || !items || !Array.isArray(items)) {
        return res.status(400).json({ error: 'Webhook URL dan daftar data barang wajib disertakan.' });
      }

      // Forward to Google Apps Script Web App
      const sheetsResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'appendRows',
          timestamp: new Date().toISOString(),
          items,
        }),
      });

      const responseText = await sheetsResponse.text();
      return res.json({
        ok: true,
        message: 'Data berhasil disinkronisasi ke Google Spreadsheet via Webhook.',
        details: responseText,
      });
    } catch (err: any) {
      console.error('Error forwarding to Google Sheets:', err);
      return res.status(500).json({
        ok: false,
        error: 'Gagal menghubungkan ke URL Google Sheets: ' + (err.message || 'Network error'),
      });
    }
  });

  // Mount Vite middleware in development mode
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve built frontend
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SmartRekap OCR Server ready on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
