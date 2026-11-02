'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Layers, 
  Users, 
  Receipt, 
  Plus, 
  Edit3, 
  Trash2, 
  MessageSquare, 
  Search, 
  ExternalLink, 
  Eye, 
  CheckCircle2, 
  Clock, 
  Package, 
  Database, 
  Copy, 
  RefreshCw, 
  LogOut, 
  Lock, 
  Store,
  DollarSign,
  TrendingUp,
  FileCheck,
  AlertCircle
} from 'lucide-react';
import { Product, Customer, Order, PaymentStatus } from '@/types/database';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { formatRupiah, formatDate, formatPhoneNumber, createWhatsAppUrl } from '@/lib/utils';
import { STORE_NAME, STORE_SLOGAN, INITIAL_PRODUCTS, DEFAULT_ADMIN_WA } from '@/lib/constants';
import { useToast } from '@/context/ToastContext';
import AdminProductModal from '@/components/AdminProductModal';
import WhatsAppTemplatesModal from '@/components/WhatsAppTemplatesModal';

export default function AdminDashboardPage() {
  const { success, error, info } = useToast();

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [authError, setAuthError] = useState('');

  // Active Tab: 'products' | 'orders' | 'customers' | 'database'
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'customers' | 'database'>('orders');

  // Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('Semua');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('Semua');
  const [customerSearch, setCustomerSearch] = useState('');

  // Modals
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [isWaModalOpen, setIsWaModalOpen] = useState(false);
  const [selectedWaOrder, setSelectedWaOrder] = useState<Order | null>(null);
  const [selectedWaCustomer, setSelectedWaCustomer] = useState<Customer | null>(null);

  const [previewProofUrl, setPreviewProofUrl] = useState<string | null>(null);
  const [sqlCopied, setSqlCopied] = useState(false);

  // Check auth session
  useEffect(() => {
    const session = sessionStorage.getItem('gentina_admin_auth');
    if (session === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPin = process.env.NEXT_PUBLIC_ADMIN_PIN || 'admin123';
    if (pinInput === correctPin || pinInput === 'admin123') {
      setIsAuthenticated(true);
      sessionStorage.setItem('gentina_admin_auth', 'true');
      setAuthError('');
      success('Selamat datang di Panel Pengelola & CRM Gentina Jaya Textile!');
    } else {
      setAuthError('PIN akses salah. Gunakan PIN default: admin123');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('gentina_admin_auth');
    setIsAuthenticated(false);
    info('Anda telah keluar dari Panel Admin.');
  };

  // Fetch all data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (isSupabaseConfigured()) {
        // 1. Fetch Products
        const { data: prodData } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (prodData) setProducts(prodData as Product[]);

        // 2. Fetch Customers
        const { data: custData } = await supabase
          .from('customers')
          .select('*')
          .order('created_at', { ascending: false });

        if (custData) setCustomers(custData as Customer[]);

        // 3. Fetch Orders with Customer join
        const { data: ordData } = await supabase
          .from('orders')
          .select(`
            *,
            customer:customers(id, name, store_name, phone_number, notes)
          `)
          .order('created_at', { ascending: false });

        if (ordData) setOrders(ordData as Order[]);
      } else {
        // Offline / Local Demo mode
        const localProds = JSON.parse(localStorage.getItem('gentina_offline_products') || 'null');
        setProducts(localProds || INITIAL_PRODUCTS);

        const localOrders = JSON.parse(localStorage.getItem('gentina_offline_orders') || '[]');
        setOrders(localOrders);

        // Derive customers from orders if none
        const custMap = new Map<string, Customer>();
        localOrders.forEach((o: Order) => {
          if (o.customer && o.customer.phone_number) {
            custMap.set(o.customer.phone_number, o.customer);
          }
        });
        setCustomers(Array.from(custMap.values()));
      }
    } catch (err) {
      console.error('Fetch admin data error:', err);
      error('Gagal mengambil data dari Supabase.');
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, fetchData]);

  // Seed sample products if database is empty
  const handleSeedProducts = async () => {
    if (!isSupabaseConfigured()) {
      localStorage.setItem('gentina_offline_products', JSON.stringify(INITIAL_PRODUCTS));
      setProducts(INITIAL_PRODUCTS);
      success('Katalog demo berhasil dimuat!');
      return;
    }

    setLoading(true);
    try {
      const inserts = INITIAL_PRODUCTS.map((p) => ({
        name: p.name,
        category: p.category,
        unit: p.unit,
        price: p.price,
        is_ready: p.is_ready,
        image_url: p.image_url,
      }));

      const { data, error: seedErr } = await supabase
        .from('products')
        .insert(inserts)
        .select();

      if (seedErr) throw seedErr;

      success(`${data.length} produk katalog berhasil dimasukkan ke database Supabase!`);
      fetchData();
    } catch (err: unknown) {
      console.error('Seed error:', err);
      error('Gagal memasukkan data awal produk.');
    } finally {
      setLoading(false);
    }
  };

  // Toggle product stock status
  const handleToggleStock = async (product: Product) => {
    const updatedStatus = !product.is_ready;

    if (isSupabaseConfigured()) {
      const { error: updateErr } = await supabase
        .from('products')
        .update({ is_ready: updatedStatus })
        .eq('id', product.id);

      if (updateErr) {
        error('Gagal memperbarui status stok');
        return;
      }
    }

    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, is_ready: updatedStatus } : p))
    );
    success(`Status stok "${product.name}" diubah menjadi ${updatedStatus ? 'Ready Stock' : 'PO'}.`);
  };

  // Delete product
  const handleDeleteProduct = async (product: Product) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus "${product.name}" dari katalog?`)) {
      return;
    }

    if (isSupabaseConfigured()) {
      const { error: delErr } = await supabase
        .from('products')
        .delete()
        .eq('id', product.id);

      if (delErr) {
        error('Gagal menghapus produk dari database');
        return;
      }
    }

    setProducts((prev) => prev.filter((p) => p.id !== product.id));
    success(`Produk "${product.name}" berhasil dihapus.`);
  };

  // Update Order Status
  const handleUpdateOrderStatus = async (orderId: string, newStatus: PaymentStatus) => {
    if (isSupabaseConfigured()) {
      const { error: updateErr } = await supabase
        .from('orders')
        .update({ payment_status: newStatus })
        .eq('id', orderId);

      if (updateErr) {
        error('Gagal memperbarui status pembayaran pesanan');
        return;
      }
    }

    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, payment_status: newStatus } : o))
    );
    success(`Status transaksi #${orderId} diubah menjadi "${newStatus}".`);
  };

  // Update Customer Notes
  const handleUpdateCustomerNotes = async (customerId: string, newNotes: string) => {
    if (isSupabaseConfigured()) {
      await supabase
        .from('customers')
        .update({ notes: newNotes })
        .eq('id', customerId);
    }
    setCustomers((prev) =>
      prev.map((c) => (c.id === customerId ? { ...c, notes: newNotes } : c))
    );
    success('Catatan pelanggan berhasil diperbarui.');
  };

  // Analytics Computations
  const stats = useMemo(() => {
    const totalOmzet = orders.reduce((sum, o) => {
      // Exclude cancelled orders
      return o.payment_status !== 'Dibatalkan' ? sum + Number(o.total_amount) : sum;
    }, 0);

    const pendingOrdersCount = orders.filter(
      (o) => o.payment_status === 'Menunggu Konfirmasi' || o.payment_status === 'Menunggu Verifikasi Pembayaran'
    ).length;

    return {
      totalOmzet,
      totalOrders: orders.length,
      pendingOrdersCount,
      totalCustomers: customers.length,
      totalProducts: products.length,
    };
  }, [orders, customers, products]);

  // Aggregated Customer CRM Records
  const customerCRMList = useMemo(() => {
    return customers.map((c) => {
      const cleanCustPhone = formatPhoneNumber(c.phone_number);
      const custOrders = orders.filter(
        (o) =>
          o.customer_id === c.id ||
          (o.customer?.phone_number && formatPhoneNumber(o.customer.phone_number) === cleanCustPhone)
      );

      const totalSpent = custOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);
      const lastOrder = custOrders[0]?.created_at || c.created_at;

      return {
        ...c,
        orderCount: custOrders.length,
        totalSpent,
        lastOrderDate: lastOrder,
      };
    });
  }, [customers, orders]);

  // Filtered Lists
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(productSearch.toLowerCase());
      const matchesCategory =
        productCategoryFilter === 'Semua' || p.category === productCategoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [products, productSearch, productCategoryFilter]);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const query = orderSearch.toLowerCase();
      const matchesSearch =
        o.id.toLowerCase().includes(query) ||
        (o.customer?.name && o.customer.name.toLowerCase().includes(query)) ||
        (o.customer?.phone_number && o.customer.phone_number.includes(query)) ||
        (o.customer?.store_name && o.customer.store_name.toLowerCase().includes(query));

      const matchesStatus =
        orderStatusFilter === 'Semua' || o.payment_status === orderStatusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, orderSearch, orderStatusFilter]);

  const filteredCustomers = useMemo(() => {
    return customerCRMList.filter((c) => {
      const q = customerSearch.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        (c.store_name && c.store_name.toLowerCase().includes(q)) ||
        c.phone_number.includes(q) ||
        (c.notes && c.notes.toLowerCase().includes(q))
      );
    });
  }, [customerCRMList, customerSearch]);

  // Copy SQL script helper
  const handleCopySql = () => {
    const sqlText = `-- Jalankan query ini di SQL Editor Supabase:
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    store_name TEXT,
    phone_number TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    order_details JSONB NOT NULL,
    total_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
    payment_status TEXT NOT NULL DEFAULT 'Menunggu Konfirmasi',
    proof_image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Policies & Storage Bucket
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public products viewable" ON public.products FOR SELECT USING (true);
CREATE POLICY "Public insert products" ON public.products FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update products" ON public.products FOR UPDATE USING (true);
CREATE POLICY "Public delete products" ON public.products FOR DELETE USING (true);

CREATE POLICY "Public customers viewable" ON public.customers FOR SELECT USING (true);
CREATE POLICY "Public insert customers" ON public.customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update customers" ON public.customers FOR UPDATE USING (true);

CREATE POLICY "Public orders viewable" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Public insert orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update orders" ON public.orders FOR UPDATE USING (true);

INSERT INTO storage.buckets (id, name, public) VALUES ('gentina-media', 'gentina-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;
CREATE POLICY "Public media view" ON storage.objects FOR SELECT USING (bucket_id = 'gentina-media');
CREATE POLICY "Public media insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'gentina-media');
`;
    navigator.clipboard.writeText(sqlText);
    setSqlCopied(true);
    info('Script SQL Supabase disalin ke clipboard');
    setTimeout(() => setSqlCopied(false), 2500);
  };

  // Auth Gate Render
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-slate-700 text-center animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-4 border border-teal-100 shadow-inner">
            <Lock className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Akses Panel Admin
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {STORE_NAME} &bull; Manajemen Toko & CRM
          </p>

          <form onSubmit={handleLogin} className="mt-6 space-y-4 text-left">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Masukkan PIN Pengelola
              </label>
              <input
                type="password"
                required
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="PIN Default: admin123"
                className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono tracking-widest text-center"
              />
              {authError && (
                <p className="text-xs text-rose-500 mt-1.5 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {authError}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md shadow-teal-600/30 transition active:scale-98 cursor-pointer"
            >
              Buka Panel Admin
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <Link href="/" className="hover:text-teal-600 flex items-center gap-1 font-medium">
              <Store className="w-3.5 h-3.5" />
              Kembali ke Toko
            </Link>
            <span className="font-mono text-[11px]">PIN: admin123</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Admin Navbar */}
      <header className="bg-slate-900 text-white sticky top-0 z-40 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-base tracking-tight block">
                  {STORE_NAME} <span className="text-teal-400 font-normal text-xs ml-1">Panel Admin</span>
                </span>
                <span className="text-[10px] text-slate-400 hidden sm:block">
                  {STORE_SLOGAN}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* Connection Pill */}
              <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-[11px]">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isSupabaseConfigured() ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                  }`}
                />
                <span className="text-slate-300">
                  {isSupabaseConfigured() ? 'Supabase Terhubung' : 'Mode Demo Standby'}
                </span>
              </div>

              <button
                onClick={fetchData}
                disabled={loading}
                className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition"
                title="Muat Ulang Data"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>

              <Link
                href="/"
                target="_blank"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs font-semibold border border-slate-700 transition"
              >
                <Store className="w-3.5 h-3.5" />
                <span>Lihat Web Toko</span>
                <ExternalLink className="w-3 h-3 ml-0.5" />
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-xs font-semibold border border-rose-800/50 transition"
                title="Keluar"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Omzet */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 block">Total Omzet Masuk</span>
              <span className="text-lg sm:text-xl font-black text-slate-900 mt-1 block">
                {formatRupiah(stats.totalOmzet)}
              </span>
              <span className="text-[10px] text-teal-700 font-medium">Dari {stats.totalOrders} transaksi</span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>

          {/* Pending Orders */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 block">Pesanan Menunggu</span>
              <span className="text-lg sm:text-xl font-black text-amber-600 mt-1 block">
                {stats.pendingOrdersCount} Order
              </span>
              <span className="text-[10px] text-slate-400">Butuh konfirmasi / cek bukti</span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          {/* Customers */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 block">Pelanggan CRM</span>
              <span className="text-lg sm:text-xl font-black text-indigo-600 mt-1 block">
                {stats.totalCustomers} Kontak
              </span>
              <span className="text-[10px] text-slate-400">Toko & konveksi aktif</span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>

          {/* Products */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 block">Katalog Produk</span>
              <span className="text-lg sm:text-xl font-black text-teal-700 mt-1 block">
                {stats.totalProducts} Item
              </span>
              <span className="text-[10px] text-slate-400">Kain & alat konveksi</span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Layers className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 gap-2 overflow-x-auto pb-px">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-5 py-3 font-bold text-xs sm:text-sm border-b-2 transition whitespace-nowrap ${
              activeTab === 'orders'
                ? 'border-teal-600 text-teal-700 bg-teal-50/50 rounded-t-xl'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Riwayat Order & Bukti Transaksi</span>
            {stats.pendingOrdersCount > 0 && (
              <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                {stats.pendingOrdersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('customers')}
            className={`flex items-center gap-2 px-5 py-3 font-bold text-xs sm:text-sm border-b-2 transition whitespace-nowrap ${
              activeTab === 'customers'
                ? 'border-teal-600 text-teal-700 bg-teal-50/50 rounded-t-xl'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Buku Kontak Pelanggan (CRM)</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 px-5 py-3 font-bold text-xs sm:text-sm border-b-2 transition whitespace-nowrap ${
              activeTab === 'products'
                ? 'border-teal-600 text-teal-700 bg-teal-50/50 rounded-t-xl'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Manajemen Katalog Produk (CRUD)</span>
          </button>

          <button
            onClick={() => setActiveTab('database')}
            className={`flex items-center gap-2 px-5 py-3 font-bold text-xs sm:text-sm border-b-2 transition whitespace-nowrap ${
              activeTab === 'database'
                ? 'border-teal-600 text-teal-700 bg-teal-50/50 rounded-t-xl'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Setup SQL Supabase</span>
          </button>
        </div>

        {/* TAB 1: ORDERS & PROOF VERIFICATION */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-5">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="Cari No. Order, Nama, atau No. WA..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50/50"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
                <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Status:</span>
                {['Semua', 'Menunggu Konfirmasi', 'Menunggu Verifikasi Pembayaran', 'Diproses', 'Selesai'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setOrderStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                      orderStatusFilter === st
                        ? 'bg-teal-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider">
                  <tr>
                    <th className="p-4">No. Transaksi & Waktu</th>
                    <th className="p-4">Pelanggan / Konveksi</th>
                    <th className="p-4">Rincian Barang</th>
                    <th className="p-4">Total Nominal</th>
                    <th className="p-4">Status Pembayaran</th>
                    <th className="p-4">Bukti Transfer</th>
                    <th className="p-4 text-center">Aksi / Follow-Up</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
                        Tidak ada riwayat transaksi yang ditemukan.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-slate-50/70 transition">
                        <td className="p-4 font-mono">
                          <span className="font-bold text-slate-900 block">{ord.id}</span>
                          <span className="text-[11px] text-slate-400 font-sans">
                            {formatDate(ord.created_at)}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="font-bold text-slate-900 block">
                            {ord.customer?.name || 'Pelanggan Toko'}
                          </span>
                          {ord.customer?.store_name && (
                            <span className="text-[11px] text-teal-700 block font-medium">
                              {ord.customer.store_name}
                            </span>
                          )}
                          <span className="text-[11px] text-slate-500 font-mono">
                            {ord.customer?.phone_number || '-'}
                          </span>
                        </td>
                        <td className="p-4 max-w-xs">
                          <div className="space-y-1">
                            {ord.order_details.slice(0, 2).map((item, i) => (
                              <div key={i} className="truncate text-[11px] text-slate-700">
                                • {item.name} ({item.quantity} {item.unit})
                              </div>
                            ))}
                            {ord.order_details.length > 2 && (
                              <span className="text-[10px] text-slate-400 font-medium">
                                +{ord.order_details.length - 2} item lainnya
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="font-bold text-teal-800 text-sm">
                            {formatRupiah(ord.total_amount)}
                          </span>
                        </td>
                        <td className="p-4">
                          {/* Quick Status Select */}
                          <select
                            value={ord.payment_status}
                            onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value as PaymentStatus)}
                            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                              ord.payment_status === 'Menunggu Konfirmasi'
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : ord.payment_status === 'Menunggu Verifikasi Pembayaran'
                                ? 'bg-sky-50 text-sky-800 border-sky-200'
                                : ord.payment_status === 'Diproses'
                                ? 'bg-teal-50 text-teal-800 border-teal-200'
                                : ord.payment_status === 'Selesai'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-rose-50 text-rose-800 border-rose-200'
                            }`}
                          >
                            <option value="Menunggu Konfirmasi">Menunggu Konfirmasi</option>
                            <option value="Menunggu Verifikasi Pembayaran">Menunggu Verifikasi</option>
                            <option value="Diproses">Diproses (Potong/Kemas)</option>
                            <option value="Selesai">Selesai / Terkirim</option>
                            <option value="Dibatalkan">Dibatalkan</option>
                          </select>
                        </td>
                        <td className="p-4">
                          {ord.proof_image_url ? (
                            <button
                              type="button"
                              onClick={() => setPreviewProofUrl(ord.proof_image_url)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-teal-50 text-teal-700 hover:bg-teal-100 text-[11px] font-bold border border-teal-200 transition"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Lihat Bukti</span>
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">
                              Belum diunggah
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedWaOrder(ord);
                              setSelectedWaCustomer(ord.customer || null);
                              setIsWaModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition active:scale-95"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Follow-Up WA</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: CRM & CUSTOMER CONTACT BOOK */}
        {activeTab === 'customers' && (
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-5">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  Buku Kontak Pelanggan & CRM
                </h3>
                <p className="text-xs text-slate-500">
                  Data otomatis tercatat saat pemesanan kain/alat konveksi berlangsung.
                </p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  placeholder="Cari nama, konveksi, atau no. WA..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50/50"
                />
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Nama Pelanggan</th>
                    <th className="p-4">Toko / Konveksi</th>
                    <th className="p-4">No. WhatsApp</th>
                    <th className="p-4">Frekuensi Transaksi</th>
                    <th className="p-4">Akumulasi Belanja</th>
                    <th className="p-4">Catatan Khusus Pelanggan</th>
                    <th className="p-4 text-center">Aksi CRM</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
                        Belum ada kontak pelanggan terdata.
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map((cust) => (
                      <tr key={cust.id} className="hover:bg-slate-50/70 transition">
                        <td className="p-4">
                          <span className="font-bold text-slate-900 text-sm block">
                            {cust.name}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Terdaftar: {formatDate(cust.created_at)}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="font-semibold text-slate-800">
                            {cust.store_name || '-'}
                          </span>
                        </td>
                        <td className="p-4 font-mono font-medium text-slate-700">
                          {cust.phone_number}
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-teal-50 text-teal-800 font-bold text-xs border border-teal-200">
                            {cust.orderCount} Kali Pesan
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="font-black text-slate-900 text-xs">
                            {formatRupiah(cust.totalSpent)}
                          </span>
                        </td>
                        <td className="p-4 max-w-xs">
                          <input
                            type="text"
                            defaultValue={cust.notes || ''}
                            onBlur={(e) => handleUpdateCustomerNotes(cust.id, e.target.value)}
                            placeholder="Klik untuk tambah catatan preferensi..."
                            className="w-full text-xs p-1.5 rounded-lg border border-transparent hover:border-slate-300 focus:border-teal-500 focus:bg-white bg-slate-50 text-slate-700 transition"
                          />
                        </td>
                        <td className="p-4 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedWaCustomer(cust);
                              setSelectedWaOrder(null);
                              setIsWaModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition active:scale-95"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Chat WA</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: PRODUCTS CATALOG MANAGEMENT (CRUD) */}
        {activeTab === 'products' && (
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-5">
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Cari produk kain / alat..."
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50/50"
                  />
                </div>

                <select
                  value={productCategoryFilter}
                  onChange={(e) => setProductCategoryFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 bg-white"
                >
                  <option value="Semua">Semua Kategori</option>
                  <option value="Kain">Kain</option>
                  <option value="Alat Konveksi">Alat Konveksi</option>
                </select>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                {products.length === 0 && (
                  <button
                    type="button"
                    onClick={handleSeedProducts}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200 transition"
                  >
                    <span>Muat Contoh Produk (12 Item)</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setSelectedProduct(null);
                    setIsProductModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-600/30 transition active:scale-98 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Produk Baru</span>
                </button>
              </div>
            </div>

            {/* Products Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Foto</th>
                    <th className="p-4">Nama Produk</th>
                    <th className="p-4">Kategori</th>
                    <th className="p-4">Satuan</th>
                    <th className="p-4">Harga Satuan</th>
                    <th className="p-4">Status Stok</th>
                    <th className="p-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
                        Tidak ada produk yang cocok dengan pencarian.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/70 transition">
                        <td className="p-4">
                          <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
                            {p.image_url ? (
                              <img
                                src={p.image_url}
                                alt={p.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Layers className="w-5 h-5 text-slate-400" />
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="font-bold text-slate-900 text-sm block">
                            {p.name}
                          </span>
                        </td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              p.category === 'Kain'
                                ? 'bg-teal-50 text-teal-800 border border-teal-200'
                                : 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                            }`}
                          >
                            {p.category}
                          </span>
                        </td>
                        <td className="p-4 font-semibold text-slate-600 uppercase text-[11px]">
                          {p.unit}
                        </td>
                        <td className="p-4">
                          <span className="font-black text-slate-900 text-sm">
                            {formatRupiah(p.price)}
                          </span>
                        </td>
                        <td className="p-4">
                          <button
                            type="button"
                            onClick={() => handleToggleStock(p)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                              p.is_ready
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                                : 'bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100'
                            }`}
                          >
                            {p.is_ready ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Ready Stock</span>
                              </>
                            ) : (
                              <>
                                <Clock className="w-3.5 h-3.5 text-amber-600" />
                                <span>Pre-Order (PO)</span>
                              </>
                            )}
                          </button>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedProduct(p);
                                setIsProductModalOpen(true);
                              }}
                              className="p-2 rounded-xl text-slate-600 hover:text-teal-700 hover:bg-teal-50 transition"
                              title="Edit Produk"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteProduct(p)}
                              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                              title="Hapus Produk"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: DATABASE & SUPABASE SETUP */}
        {activeTab === 'database' && (
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                <Database className="w-5 h-5 text-teal-600" />
                <span>Panduan Koneksi & SQL Schema Supabase</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Ikuti langkah berikut untuk mengaktifkan database Supabase PostgreSQL untuk GENTINA JAYA TEXTILE.
              </p>
            </div>

            {/* Steps */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-100 space-y-1.5">
                <span className="w-6 h-6 rounded-full bg-teal-600 text-white font-bold inline-flex items-center justify-center text-xs">
                  1
                </span>
                <h4 className="font-bold text-slate-900 text-sm">Buat Proyek Supabase</h4>
                <p className="text-slate-600 leading-relaxed">
                  Buka <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-teal-700 font-bold underline">supabase.com</a>, buat akun dan proyek baru, pilih region Singapura untuk performa cepat.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-100 space-y-1.5">
                <span className="w-6 h-6 rounded-full bg-teal-600 text-white font-bold inline-flex items-center justify-center text-xs">
                  2
                </span>
                <h4 className="font-bold text-slate-900 text-sm">Eksekusi Script SQL</h4>
                <p className="text-slate-600 leading-relaxed">
                  Buka menu <strong>SQL Editor</strong> di dashboard Supabase, klik <em>New Query</em>, tempel kode SQL di bawah ini dan klik <strong>Run</strong>.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-100 space-y-1.5">
                <span className="w-6 h-6 rounded-full bg-teal-600 text-white font-bold inline-flex items-center justify-center text-xs">
                  3
                </span>
                <h4 className="font-bold text-slate-900 text-sm">Pasang API Keys ke .env.local</h4>
                <p className="text-slate-600 leading-relaxed">
                  Salin <strong>Project URL</strong> dan <strong>Anon Public Key</strong> dari Settings &gt; API, tempel ke file <code className="font-mono text-teal-800">.env.local</code>.
                </p>
              </div>
            </div>

            {/* SQL Block */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  SQL DDL (Tabel products, customers, orders & Storage)
                </span>
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition"
                >
                  {sqlCopied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{sqlCopied ? 'Tersalin!' : 'Salin Semua SQL'}</span>
                </button>
              </div>

              <pre className="p-4 rounded-2xl bg-slate-900 text-teal-300 font-mono text-xs overflow-x-auto max-h-96 leading-relaxed">
{`-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Kain', 'Alat Konveksi')),
    unit TEXT NOT NULL, -- meter, roll, yard, lusin, gross, cones, pcs
    price NUMERIC(12, 2) NOT NULL DEFAULT 0,
    is_ready BOOLEAN NOT NULL DEFAULT true,
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Create Customers Table
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    store_name TEXT,
    phone_number TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Create Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    order_details JSONB NOT NULL,
    total_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
    payment_status TEXT NOT NULL DEFAULT 'Menunggu Konfirmasi',
    proof_image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Row Level Security (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public products viewable" ON public.products FOR SELECT USING (true);
CREATE POLICY "Public insert products" ON public.products FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update products" ON public.products FOR UPDATE USING (true);
CREATE POLICY "Public delete products" ON public.products FOR DELETE USING (true);

CREATE POLICY "Public customers viewable" ON public.customers FOR SELECT USING (true);
CREATE POLICY "Public insert customers" ON public.customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update customers" ON public.customers FOR UPDATE USING (true);

CREATE POLICY "Public orders viewable" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Public insert orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update orders" ON public.orders FOR UPDATE USING (true);

-- 6. Storage Bucket for Media
INSERT INTO storage.buckets (id, name, public) VALUES ('gentina-media', 'gentina-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;
CREATE POLICY "Public media view" ON storage.objects FOR SELECT USING (bucket_id = 'gentina-media');
CREATE POLICY "Public media insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'gentina-media');
`}
              </pre>
            </div>
          </div>
        )}
      </main>

      {/* Product CRUD Modal */}
      <AdminProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        product={selectedProduct}
        onSuccess={() => {
          fetchData();
        }}
      />

      {/* WhatsApp Follow-Up Modal */}
      <WhatsAppTemplatesModal
        isOpen={isWaModalOpen}
        onClose={() => setIsWaModalOpen(false)}
        order={selectedWaOrder}
        customer={selectedWaCustomer}
      />

      {/* Proof Preview Modal */}
      {previewProofUrl && (
        <div
          onClick={() => setPreviewProofUrl(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-5 max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="font-bold text-slate-900 text-sm">Lampiran Bukti Transfer Pelanggan</h4>
              <button
                onClick={() => setPreviewProofUrl(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                Tutup
              </button>
            </div>
            <div className="p-2 flex-1 overflow-auto flex items-center justify-center">
              <img
                src={previewProofUrl}
                alt="Bukti Transfer"
                className="max-w-full max-h-[70vh] object-contain rounded-xl"
              />
            </div>
            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <a
                href={previewProofUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-teal-700 font-bold hover:underline"
              >
                <span>Buka Gambar Ukuran Penuh</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
