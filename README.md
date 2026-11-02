# 🧵 GENTINA JAYA TEXTILE — Web Retail Kain & Alat Konveksi

> **Slogan:** *"Solusi tepat untuk kebutuhan kain dan konveksimu"*

Aplikasi web modern, responsif, dan siap pakai (*production-ready*) untuk retail kain dan alat konveksi **GENTINA JAYA TEXTILE**. Dibangun menggunakan **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, dan database **Supabase (PostgreSQL & Storage)**.

---

## 🎨 Tema Visual & Branding
- **Warna Utama:** Biru Toska (`#0d9488` / `#14b8a6`) & Putih Bersih (`#ffffff`)
- **Latar Belakang:** Aksen abu-abu terang (`#f8fafc`)
- **Desain UI:** Modern, elegan, responsif di Smartphone & Desktop dengan icon **Lucide React**

---

## ✨ Fitur-Fitur Utama

### 1. Halaman Publik / Dashboard Pelanggan
- **Header & Branding:** Menampilkan logo "GENTINA JAYA TEXTILE", slogan resmi, counter badge keranjang belanja, serta tombol akses ke Panel Admin.
- **Katalog Produk Dinamis:**
  - Terkoneksi langsung ke tabel `products` di database Supabase.
  - Filter kategori: **Semua**, **Kain** (*roll / meter*), dan **Alat Konveksi** (*lusin, gross, cones, yard, pcs*).
  - Filter ketersediaan stok: **Ready Stock** dan **Pre-Order (PO)**.
  - Pencarian *real-time* berdasarkan nama bahan/alat, kategori, atau satuan.
  - Card produk dengan foto, harga per satuan formatted Rupiah (`Rp xx.xxx`), status stok, pemilih kuantiti (*stepper*), dan tombol **+ Tambah ke Keranjang**.
- **Keranjang Belanja & Integrasi WhatsApp (Order to WA):**
  - Drawer keranjang belanja yang menghitung total item dan subtotal harga secara otomatis.
  - Formulir identitas pemesan: Nama Pemesan, Nama Toko/Konveksi, Nomor WhatsApp aktif, dan Catatan pesanan.
  - Tombol **"Kirim Pesanan ke WhatsApp"**:
    1. Otomatis menyimpan data pelanggan ke tabel `customers`.
    2. Otomatis mencatat order ke tabel `orders` di Supabase dengan status `Menunggu Konfirmasi` dan ID Transaksi unik (`GJT-YYYYMMDD-XXXX`).
    3. Mengarahkan pelanggan ke tautan resmi WhatsApp Admin (`NEXT_PUBLIC_ADMIN_WA`) dengan pesan pesanan terstruktur rapi.
- **Pelacakan Status & Unggah Bukti Transaksi (`/tracking`):**
  - Pelanggan dapat mengecek riwayat pesanan menggunakan Nomor WhatsApp atau Nomor Transaksi.
  - Menampilkan status pesanan (*Menunggu Konfirmasi, Menunggu Verifikasi Pembayaran, Diproses, Selesai*).
  - Unggah bukti transfer/pembayaran langsung ke **Supabase Storage** (`gentina-media/proofs`).

### 2. Dashboard Admin & CRM (`/admin`)
- **Proteksi Akses PIN:** Melindungi panel pengelola (Default PIN: `admin123`).
- **Ringkasan KPI Penjualan:** Total Omzet Penjualan, Pesanan Menunggu Konfirmasi, Total Pelanggan CRM, dan Jumlah Produk Aktif.
- **Manajemen Katalog Produk (CRUD):**
  - Tambah produk baru dengan upload foto langsung ke Supabase Storage.
  - Edit nama, kategori (*Kain / Alat Konveksi*), satuan (*roll, meter, lusin, dll.*), harga, dan status ketersediaan.
  - Toggle cepat status stok (*Ready Stock / PO*) langsung dari tabel.
  - Hapus produk dari katalog.
- **Pencatatan Transaksi & Verifikasi Pembayaran:**
  - Daftar order masuk lengkap dengan tanggal, nama pemesan, nama toko konveksi, rincian barang, total nominal, dan status pembayaran.
  - Pratinjau (*preview & zoom*) lampiran bukti transfer yang diunggah pelanggan.
  - Ubah status transaksi secara instan (*Menunggu Konfirmasi, Diproses, Selesai, Dibatalkan*).
- **Buku Kontak Pelanggan (CRM):**
  - Otomatis mencatat nama pembeli, nomor WhatsApp, nama usaha konveksi, frekuensi pemesanan, dan total akumulasi belanja.
  - Fitur penambahan catatan khusus preferensi pelanggan (misal: "Langganan combed 30s hitam reaktif per minggu").
- **Quick Follow-Up WhatsApp Button:**
  - Tombol aksi di tiap baris pesanan & kontak pelanggan untuk membuka WhatsApp dengan template pesan resmi toko:
    - *Sapaan & Tagihan Rekening Pembayaran*
    - *Konfirmasi Pembayaran Diterima & Pesanan Sedang Dipotong/Kemas*
    - *Update No. Resi Pengiriman Cargo (Dakota, Indah Cargo, J&T)*
    - *Pesanan Selesai & Ucapan Terima Kasih*
    - *Broadcast Promo / Penawaran Kain & Bahan Baru*

---

## 🗄️ Struktur Database (Supabase PostgreSQL)

File SQL lengkap tersedia di: [`supabase/schema.sql`](./supabase/schema.sql)

```sql
-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Kain', 'Alat Konveksi')),
    unit TEXT NOT NULL,
    price NUMERIC(12, 2) NOT NULL DEFAULT 0,
    is_ready BOOLEAN NOT NULL DEFAULT true,
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Customers Table
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    store_name TEXT,
    phone_number TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    order_details JSONB NOT NULL,
    total_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
    payment_status TEXT NOT NULL DEFAULT 'Menunggu Konfirmasi',
    proof_image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Storage Bucket Configuration
INSERT INTO storage.buckets (id, name, public) 
VALUES ('gentina-media', 'gentina-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;
```

---

## 🚀 Panduan Menjalankan Proyek

### 1. Salin Environment Variables
Salin file `.env.example` menjadi `.env.local`:
```bash
cp .env.example .env.local
```

Isi konfigurasi pada file `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_ADMIN_WA=6281234567890
NEXT_PUBLIC_ADMIN_PIN=admin123
```

### 2. Eksekusi Script SQL di Supabase
1. Masuk ke [dashboard.supabase.com](https://dashboard.supabase.com).
2. Buka menu **SQL Editor** &gt; **New Query**.
3. Buka file `supabase/schema.sql`, salin seluruh isinya dan klik **Run**.

### 3. Menjalankan Server Pengembangan
```bash
npm run dev
```
Buka browser di: `http://localhost:3000`

### 4. Build untuk Production
```bash
npm run build
npm start
```
