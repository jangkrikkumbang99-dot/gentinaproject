export type ProductCategory = 'Kain' | 'Alat Konveksi';

export type ProductUnit = 
  | 'meter' 
  | 'roll' 
  | 'yard' 
  | 'lusin' 
  | 'gross' 
  | 'cones' 
  | 'pcs';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  unit: ProductUnit | string;
  price: number;
  is_ready: boolean;
  image_url: string | null;
  created_at?: string;
}

export interface Customer {
  id: string;
  name: string;
  store_name: string | null;
  phone_number: string;
  notes: string | null;
  created_at?: string;
}

export interface OrderItem {
  product_id: string;
  name: string;
  category: ProductCategory;
  unit: string;
  price: number;
  quantity: number;
  subtotal: number;
  image_url?: string | null;
}

export type PaymentStatus = 
  | 'Menunggu Konfirmasi'
  | 'Menunggu Verifikasi Pembayaran'
  | 'Diproses'
  | 'Selesai'
  | 'Dibatalkan';

export interface Order {
  id: string;
  customer_id: string | null;
  order_details: OrderItem[];
  total_amount: number;
  payment_status: PaymentStatus;
  proof_image_url: string | null;
  created_at: string;
  // Joined relation:
  customer?: Customer | null;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
