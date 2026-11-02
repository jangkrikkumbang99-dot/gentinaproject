'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import ProductCard from '@/components/ProductCard';
import { 
  Layers, 
  Wrench, 
  Search, 
  Sparkles, 
  ShieldCheck, 
  Truck, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  PackageCheck,
  RefreshCw,
  ShoppingBag,
  SlidersHorizontal
} from 'lucide-react';
import { Product, ProductCategory } from '@/types/database';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { INITIAL_PRODUCTS, STORE_NAME, STORE_SLOGAN, DEFAULT_ADMIN_WA } from '@/lib/constants';
import Link from 'next/link';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [selectedStockFilter, setSelectedStockFilter] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Fetch Products directly from Supabase
  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          setProducts(data as Product[]);
        } else {
          // If table is newly created without items, load default products
          setProducts(INITIAL_PRODUCTS);
        }
      } else {
        // Fallback to local storage or initial starter catalog
        const localProds = JSON.parse(localStorage.getItem('gentina_offline_products') || 'null');
        setProducts(localProds || INITIAL_PRODUCTS);
      }
    } catch (err) {
      console.error('Error fetching products from Supabase:', err);
      setProducts(INITIAL_PRODUCTS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Filter products based on Category, Stock, and Search Query
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      // Category match
      const matchesCategory =
        selectedCategory === 'Semua' || item.category === selectedCategory;

      // Stock match
      const matchesStock =
        selectedStockFilter === 'Semua' ||
        (selectedStockFilter === 'Ready' && item.is_ready) ||
        (selectedStockFilter === 'PO' && !item.is_ready);

      // Search match
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.unit.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesStock && matchesSearch;
    });
  }, [products, selectedCategory, selectedStockFilter, searchQuery]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-teal-900 via-teal-800 to-slate-900 text-white pt-12 pb-20 px-4 sm:px-6 lg:px-8">
        {/* Glow decoration */}
        <div className="absolute top-0 right-1/4 -translate-y-1/2 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-semibold backdrop-blur-md mb-6 shadow-xs animate-in fade-in duration-500">
            <Sparkles className="w-4 h-4 text-teal-300" />
            <span>Penyedia Bahan & Perlengkapan Konveksi Terpercaya</span>
          </div>

          {/* Title & Slogan */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-none">
            {STORE_NAME}
          </h1>
          <p className="mt-4 text-lg sm:text-2xl text-teal-200 font-medium italic max-w-2xl mx-auto">
            &ldquo;{STORE_SLOGAN}&rdquo;
          </p>
          <p className="mt-3 text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Menyediakan aneka kain berkualitas tinggi (Katun Combed, Rayon Twill, Fleece) roll & meteran serta alat konveksi terlengkap langsung dari gudang.
          </p>

          {/* Quick Actions */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="#katalog"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-teal-500/20 transition active:scale-98 flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4 text-slate-950" />
              <span>Lihat Katalog Produk</span>
            </a>
            <Link
              href="/tracking"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 backdrop-blur-md transition active:scale-98 flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4 text-teal-300" />
              <span>Lacak Pesanan / Upload Bukti</span>
            </Link>
          </div>

          {/* Value Badges */}
          <div className="mt-12 pt-8 border-t border-teal-700/50 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-teal-700/60 text-teal-300 shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-xs text-white block">Kualitas Grade A</span>
                <span className="text-[11px] text-teal-200">Bahan lembut & stabil</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-teal-700/60 text-teal-300 shrink-0">
                <PackageCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-xs text-white block">Grosir & Eceran</span>
                <span className="text-[11px] text-teal-200">Roll pabrik & meteran</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-teal-700/60 text-teal-300 shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-xs text-white block">Kirim Cargo Cepat</span>
                <span className="text-[11px] text-teal-200">Dakota, Indah, J&T</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-teal-700/60 text-teal-300 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-xs text-white block">Order to WhatsApp</span>
                <span className="text-[11px] text-teal-200">Praktis & langsung deal</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Catalog Section */}
      <section id="katalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full">
        {/* Section Header & Search */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-teal-700 uppercase tracking-wider block">
                Katalog Produk Terlengkap
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                Kain & Alat Konveksi Industri
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Pilih kebutuhan produksi konveksimu dan masukkan ke keranjang untuk order via WhatsApp.
              </p>
            </div>

            {/* Live Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari combed, rayon, benang, gunting..."
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white shadow-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-3 text-xs text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Filter Bar: Categories & Stock Status */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
            {/* Category Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {['Semua', 'Kain', 'Alat Konveksi'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/30'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat === 'Kain' && <Layers className="w-3.5 h-3.5" />}
                  {cat === 'Alat Konveksi' && <Wrench className="w-3.5 h-3.5" />}
                  <span>{cat}</span>
                  {cat === 'Kain' && (
                    <span className="text-[10px] opacity-80 font-normal hidden lg:inline">
                      (meter / roll)
                    </span>
                  )}
                  {cat === 'Alat Konveksi' && (
                    <span className="text-[10px] opacity-80 font-normal hidden lg:inline">
                      (lusin / gross / pcs)
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Availability Filter */}
            <div className="flex items-center gap-2 shrink-0">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs font-semibold text-slate-500">Stok:</span>
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl">
                {[
                  { key: 'Semua', label: 'Semua' },
                  { key: 'Ready', label: 'Ready Stock' },
                  { key: 'PO', label: 'PO' },
                ].map((s) => (
                  <button
                    key={s.key}
                    onClick={() => setSelectedStockFilter(s.key)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                      selectedStockFilter === s.key
                        ? 'bg-white text-teal-800 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="mt-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
              <RefreshCw className="w-8 h-8 text-teal-600 animate-spin" />
              <p className="text-xs text-slate-500 font-medium">Memuat katalog Gentina Jaya Textile...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 max-w-lg mx-auto space-y-4">
              <div className="w-16 h-16 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
                <Search className="w-7 h-7" />
              </div>
              <h3 className="font-extrabold text-slate-800 text-base">
                Produk Tidak Ditemukan
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Tidak ada produk yang sesuai dengan filter atau kata kunci &ldquo;{searchQuery}&rdquo;.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('Semua');
                  setSelectedStockFilter('Semua');
                }}
                className="px-4 py-2 rounded-xl bg-teal-600 text-white font-semibold text-xs shadow-sm hover:bg-teal-700 transition"
              >
                Reset Semua Filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Trust & Consultation Banner */}
      <section className="bg-white border-y border-slate-200 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">
              Konsultasi Bahan & Custom Order
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Butuh Sample Kain atau Pemesanan Skala Partai Besar?
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
              Tim spesialis tekstil Gentina Jaya Textile siap membantu perhitungan kebutuhan bahan untuk produksi konveksi kaos, hijab, kemeja, atau seragam Anda.
            </p>
          </div>

          <a
            href={`https://wa.me/${DEFAULT_ADMIN_WA}?text=Halo%20Admin%20Gentina%20Jaya%20Textile,%20saya%20ingin%20konsultasi%20pemesanan%20kain%20dan%20alat%20konveksi`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-teal-600/30 transition active:scale-98 shrink-0"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Chat WhatsApp dengan Tim Ahli Kami</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </a>
        </div>
      </section>

      {/* Slide-over Cart Drawer */}
      <CartDrawer />

      {/* Footer */}
      <Footer />
    </div>
  );
}
