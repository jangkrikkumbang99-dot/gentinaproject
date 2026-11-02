-- ==============================================================================
-- GENTINA JAYA TEXTILE - DATABASE INITIALIZATION SCRIPT (SUPABASE POSTGRESQL)
-- Slogan: "Solusi tepat untuk kebutuhan kain dan konveksimu"
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Kain', 'Alat Konveksi')),
    unit TEXT NOT NULL, -- e.g.: 'meter', 'roll', 'yard', 'lusin', 'gross', 'cones', 'pcs'
    price NUMERIC(12, 2) NOT NULL DEFAULT 0,
    is_ready BOOLEAN NOT NULL DEFAULT true,
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for faster category and availability search
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_ready ON public.products(is_ready);

-- 3. Create Customers Table
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    store_name TEXT,
    phone_number TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for phone number searches and unique constraint if desired
CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers(phone_number);

-- 4. Create Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY, -- Format: GJT-YYYYMMDD-XXXX
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    order_details JSONB NOT NULL,
    total_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
    payment_status TEXT NOT NULL DEFAULT 'Menunggu Konfirmasi',
    proof_image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for order status and customer
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Products: Everyone can read products
CREATE POLICY "Public products viewable by everyone" 
ON public.products FOR SELECT USING (true);

-- Products: Admin/Public can manage products (Anon enabled for dashboard simplicity)
CREATE POLICY "Public insert products" 
ON public.products FOR INSERT WITH CHECK (true);

CREATE POLICY "Public update products" 
ON public.products FOR UPDATE USING (true);

CREATE POLICY "Public delete products" 
ON public.products FOR DELETE USING (true);

-- Customers: Public can view, create and update their customer profiles
CREATE POLICY "Public view customers" 
ON public.customers FOR SELECT USING (true);

CREATE POLICY "Public insert customers" 
ON public.customers FOR INSERT WITH CHECK (true);

CREATE POLICY "Public update customers" 
ON public.customers FOR UPDATE USING (true);

-- Orders: Public can view orders (needed for customer tracking & admin)
CREATE POLICY "Public view orders" 
ON public.orders FOR SELECT USING (true);

CREATE POLICY "Public insert orders" 
ON public.orders FOR INSERT WITH CHECK (true);

CREATE POLICY "Public update orders" 
ON public.orders FOR UPDATE USING (true);

-- ==============================================================================
-- SUPABASE STORAGE BUCKET CONFIGURATION
-- ==============================================================================
-- Create storage bucket for gentina-media (product photos and payment proofs)
INSERT INTO storage.buckets (id, name, public)
VALUES ('gentina-media', 'gentina-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage Policies for gentina-media
CREATE POLICY "Public can view gentina media" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'gentina-media');

CREATE POLICY "Public can upload to gentina media" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'gentina-media');

CREATE POLICY "Public can update gentina media" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'gentina-media');

CREATE POLICY "Public can delete gentina media" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'gentina-media');

-- ==============================================================================
-- STARTER SEED DATA (REALISTIC TEXTILE & GARMENT PRODUCTS)
-- ==============================================================================
INSERT INTO public.products (name, category, unit, price, is_ready, image_url)
VALUES
    ('Kain Katun Combed 30s Reaktif (Soft Premium)', 'Kain', 'roll', 2450000, true, 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=600&q=80'),
    ('Kain Katun Combed 24s Reaktif (Gramasi Tebal)', 'Kain', 'roll', 2550000, true, 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=600&q=80'),
    ('Kain Rayon Twill Premium Adem (Grosir)', 'Kain', 'roll', 1850000, true, 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80'),
    ('Kain Rayon Crinkle Airflow Polos', 'Kain', 'meter', 26500, true, 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=600&q=80'),
    ('Kain Fleece PE Tebal Gramasi 280 (Hoodie/Jaket)', 'Kain', 'roll', 2250000, true, 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=600&q=80'),
    ('Kain Baby Terry Katun Lembut', 'Kain', 'meter', 45000, false, 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=600&q=80'),
    ('Benang Jahit Astra 5000 Yards 40/2 (All Colors)', 'Alat Konveksi', 'lusin', 195000, true, 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?auto=format&fit=crop&w=600&q=80'),
    ('Gunting Kain Konveksi Kodok Besi 10 Inch (Heavy Duty)', 'Alat Konveksi', 'pcs', 75000, true, 'https://images.unsplash.com/photo-1589363460779-cd717d7786bf?auto=format&fit=crop&w=600&q=80'),
    ('Jarum Mesin Jahit Industri Organ DBx1 (No. 11/14/16)', 'Alat Konveksi', 'pcs', 32000, true, 'https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&w=600&q=80'),
    ('Kancing Kemeja Polos 18L Lubang 4 (Kualitas Ekspor)', 'Alat Konveksi', 'gross', 48000, true, 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=600&q=80'),
    ('Resleting Besi / Metal YKK No. 5 Gigi Kuningan (Pants/Jacket)', 'Alat Konveksi', 'lusin', 95000, true, 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=600&q=80'),
    ('Karet Elastis Celana 3 cm White Grade A', 'Alat Konveksi', 'roll', 65000, false, 'https://images.unsplash.com/photo-1516762689617-e1cffcef479d?auto=format&fit=crop&w=600&q=80');

-- Starter customer sample
INSERT INTO public.customers (name, store_name, phone_number, notes)
VALUES
    ('Haryono Santoso', 'CV Sumber Berkah Konveksi', '6281234567890', 'Langganan kain Combed 30s roll hitam & putih. Pengiriman via Dakota Cargo.'),
    ('Siti Nurhaliza', 'Ratu Hijab & Gamis Studio', '6285712345678', 'Spesialis busana muslim. Preferensi bahan Rayon Twill dan Crinkle Airflow.');
