import { Product } from '@/types/database';

export const STORE_NAME = "GENTINA JAYA TEXTILE";
export const STORE_SLOGAN = "Solusi tepat untuk kebutuhan kain dan konveksimu";
export const STORE_ADDRESS = "Sentra Konveksi & Tekstil, Jl. Tekstil Raya No. 88, Jawa Barat";
export const STORE_OPERATING_HOURS = "Senin - Sabtu: 08.00 - 17.00 WIB";

export const DEFAULT_ADMIN_WA = process.env.NEXT_PUBLIC_ADMIN_WA || "6281234567890";

export const PRODUCT_CATEGORIES = ['Semua', 'Kain', 'Alat Konveksi'] as const;

export const PRODUCT_UNITS = [
  'meter',
  'roll',
  'yard',
  'lusin',
  'gross',
  'cones',
  'pcs'
] as const;

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    name: "Kain Katun Combed 30s Reaktif (Soft Premium)",
    category: "Kain",
    unit: "roll",
    price: 2450000,
    is_ready: true,
    image_url: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=600&q=80",
    created_at: "2026-11-01T08:00:00.000Z"
  },
  {
    id: "prod-2",
    name: "Kain Katun Combed 24s Reaktif (Gramasi Tebal)",
    category: "Kain",
    unit: "roll",
    price: 2550000,
    is_ready: true,
    image_url: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=600&q=80",
    created_at: "2026-11-01T08:00:00.000Z"
  },
  {
    id: "prod-3",
    name: "Kain Rayon Twill Premium Adem (Grosir)",
    category: "Kain",
    unit: "roll",
    price: 1850000,
    is_ready: true,
    image_url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80",
    created_at: "2026-11-01T08:00:00.000Z"
  },
  {
    id: "prod-4",
    name: "Kain Rayon Crinkle Airflow Polos (Eceran)",
    category: "Kain",
    unit: "meter",
    price: 26500,
    is_ready: true,
    image_url: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=600&q=80",
    created_at: "2026-11-01T08:00:00.000Z"
  },
  {
    id: "prod-5",
    name: "Kain Fleece PE Tebal Gramasi 280 (Hoodie/Jaket)",
    category: "Kain",
    unit: "roll",
    price: 2250000,
    is_ready: true,
    image_url: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=600&q=80",
    created_at: "2026-11-01T08:00:00.000Z"
  },
  {
    id: "prod-6",
    name: "Kain Baby Terry Katun Lembut",
    category: "Kain",
    unit: "meter",
    price: 45000,
    is_ready: false, // PO
    image_url: "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=600&q=80",
    created_at: "2026-11-01T08:00:00.000Z"
  },
  {
    id: "prod-7",
    name: "Benang Jahit Astra 5000 Yards 40/2 (All Colors)",
    category: "Alat Konveksi",
    unit: "lusin",
    price: 195000,
    is_ready: true,
    image_url: "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?auto=format&fit=crop&w=600&q=80",
    created_at: "2026-11-01T08:00:00.000Z"
  },
  {
    id: "prod-8",
    name: "Gunting Kain Konveksi Kodok Besi 10 Inch (Heavy Duty)",
    category: "Alat Konveksi",
    unit: "pcs",
    price: 75000,
    is_ready: true,
    image_url: "https://images.unsplash.com/photo-1589363460779-cd717d7786bf?auto=format&fit=crop&w=600&q=80",
    created_at: "2026-11-01T08:00:00.000Z"
  },
  {
    id: "prod-9",
    name: "Jarum Mesin Jahit Industri Organ DBx1 (No. 11/14/16)",
    category: "Alat Konveksi",
    unit: "pcs",
    price: 32000,
    is_ready: true,
    image_url: "https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&w=600&q=80",
    created_at: "2026-11-01T08:00:00.000Z"
  },
  {
    id: "prod-10",
    name: "Kancing Kemeja Polos 18L Lubang 4 (Kualitas Ekspor)",
    category: "Alat Konveksi",
    unit: "gross",
    price: 48000,
    is_ready: true,
    image_url: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=600&q=80",
    created_at: "2026-11-01T08:00:00.000Z"
  },
  {
    id: "prod-11",
    name: "Resleting Besi / Metal YKK No. 5 Gigi Kuningan",
    category: "Alat Konveksi",
    unit: "lusin",
    price: 95000,
    is_ready: true,
    image_url: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=600&q=80",
    created_at: "2026-11-01T08:00:00.000Z"
  },
  {
    id: "prod-12",
    name: "Karet Elastis Celana 3 cm White Grade A",
    category: "Alat Konveksi",
    unit: "roll",
    price: 65000,
    is_ready: false, // PO
    image_url: "https://images.unsplash.com/photo-1516762689617-e1cffcef479d?auto=format&fit=crop&w=600&q=80",
    created_at: "2026-11-01T08:00:00.000Z"
  }
];
