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
  ArrowRight,
  PackageCheck,
  ShoppingBag,
  SlidersHorizontal,
  ChevronDown,
  Star,
  Clock,
  PhoneCall,
  Scissors,
  HelpCircle
} from 'lucide-react';
import { Product } from '@/types/database';
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
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

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
          setProducts(INITIAL_PRODUCTS);
        }
      } else {
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
      const matchesCategory =
        selectedCategory === 'Semua' || item.category === selectedCategory;

      const matchesStock =
        selectedStockFilter === 'Semua' ||
        (selectedStockFilter === 'Ready' && item.is_ready) ||
        (selectedStockFilter === 'PO' && !item.is_ready);

      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.unit.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesStock && matchesSearch;
    });
  }, [products, selectedCategory, selectedStockFilter, searchQuery]);

  const faqs = [
    {
      q: 'Apakah bisa memesan kain dalam partai eceran (meteran) atau hanya roll-an?',
      a: 'Bisa! Kami melayani pembelian partai besar per roll pabrik untuk konveksi dan juga pembelian meteran untuk kebutuhan sample, UMKM tailor, maupun desainer pakaian.'
    },
    {
      q: 'Bagaimana alur pemesanan produk via WhatsApp?',
      a: 'Cukup pilih produk kain atau alat konveksi di katalog, atur kuantiti, lalu buka keranjang belanja. Klik tombol "Kirim Pesanan ke WhatsApp", dan sistem akan otomatis membuat rincian pesanan ber-ID unik yang langsung terkirim ke WhatsApp resmi admin kami.'
    },
    {
      q: 'Ekspedisi atau kargo apa saja yang digunakan untuk pengiriman?',
      a: 'Untuk pesanan partai roll besar, kami bekerjasama dengan Dakota Cargo, Indah Cargo, J&T Cargo, Baraka, dan Kobra Express. Untuk pesanan meteran dan alat jahit ringan, tersedia JNE, J&T, SiCepat, dan Lion Parcel.'
    },
    {
      q: 'Bagaimana cara konfirmasi pembayaran dan melacak pesanan?',
      a: 'Setelah melakukan transfer pembayaran ke rekening resmi toko kami, buka menu "Lacak Pesanan" di bagian atas website, masukkan nomor WhatsApp atau nomor transaksi Anda, lalu unggah foto struk transfer Anda secara langsung.'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 selection:bg-teal-500 selection:text-white">
      <Header />

      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-teal-950 via-teal-900 to-slate-900 text-white pt-14 pb-24 px-4 sm:px-6 lg:px-8">
        {/* Glow ambient background */}
        <div className="absolute top-0 right-1/4 -translate-y-1/2 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-semibold backdrop-blur-md mb-6 shadow-xs">
            <Sparkles className="w-4 h-4 text-teal-300" />
            <span>Distributor Resmi Bahan Tekstil &amp; Alat Konveksi Industri</span>
          </div>

          {/* Title & Slogan */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-none">
            {STORE_NAME}
          </h1>
          <p className="mt-4 text-xl sm:text-2xl text-teal-200 font-medium italic max-w-2xl mx-auto">
            &ldquo;{STORE_SLOGAN}&rdquo;
          </p>
          <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Pusat pasokan kain katun combed, rayon twill, airflow, baby terry, dan fleece berkualitas tinggi serta perlengkapan jahit industri terlengkap untuk garmen, konveksi kaos, dan studio fashion.
          </p>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <a
              href="#katalog"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-teal-500/25 transition flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4 text-slate-950" />
              <span>Lihat Katalog Produk</span>
            </a>
            <a
              href={`https://wa.me/${DEFAULT_ADMIN_WA}?text=Halo%20Admin%20Gentina%20Jaya%20Textile,%20saya%20ingin%20konsultasi%20pemesanan%20kain%20dan%20alat%20konveksi`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 backdrop-blur-md transition flex items-center justify-center gap-2"
            >
              <PhoneCall className="w-4 h-4 text-teal-300" />
              <span>Konsultasi Kain via WhatsApp</span>
            </a>
          </div>

          {/* Quick Metrics */}
          <div className="mt-14 pt-8 border-t border-teal-800/60 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <span className="text-2xl sm:text-3xl font-black text-white block">50+</span>
              <span className="text-xs text-teal-200 font-medium mt-0.5 block">Varian Kain &amp; Warna</span>
            </div>
            <div className="text-center">
              <span className="text-2xl sm:text-3xl font-black text-white block">100%</span>
              <span className="text-xs text-teal-200 font-medium mt-0.5 block">Jaminan Kualitas Grade A</span>
            </div>
            <div className="text-center">
              <span className="text-2xl sm:text-3xl font-black text-white block">1.500+</span>
              <span className="text-xs text-teal-200 font-medium mt-0.5 block">Roll Terkirim ke Konveksi</span>
            </div>
            <div className="text-center">
              <span className="text-2xl sm:text-3xl font-black text-white block">Nusantara</span>
              <span className="text-xs text-teal-200 font-medium mt-0.5 block">Layanan Ekspedisi Kargo</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. VALUE PROPOSITION / KEUNGGULAN SECTION */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-teal-700 uppercase tracking-wider block">
            Mengapa Memilih Kami
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Mitra Terpercaya Bisnis Konveksi &amp; Garmen Anda
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Kami memahami ketepatan gramasi kain dan kelengkapan alat jahit menentukan kelancaran proses produksi konveksi Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:border-teal-300 transition">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Bahan Grade A Terjamin</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Katun Combed reaktif 100% katun murni tanpa oplosan PE. Warna stabil, tidak cepat berbulu, dan susut minimal standar ekspor.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:border-teal-300 transition">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-4">
              <PackageCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Grosir Roll &amp; Eceran</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Tersedia harga distributor per roll pabrik (25-30 kg) maupun eceran meteran untuk pembuatan sample produk dan tailor rumahan.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:border-teal-300 transition">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-4">
              <Scissors className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Alat Konveksi Lengkap</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Benang jahit Astra 5000 yard, jarum Organ industri, gunting kodok heavy duty, kancing kemeja, resleting YKK, dan karet elastis grade A.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:border-teal-300 transition">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-4">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Pengiriman Kargo Cepat</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Kerjasama resmi ekspedisi kargo hemat (Dakota, Indah Cargo, J&amp;T Cargo) menjamin pengiriman roll kain aman ke seluruh pelosok Indonesia.
            </p>
          </div>
        </div>
      </section>

      {/* 3. KATEGORI PILIHAN (CATEGORY SHOWCASE) */}
      <section className="bg-white py-14 border-y border-slate-200/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold text-teal-700 uppercase tracking-wider block">
                Fokus Kategori Produk
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                Kebutuhan Produksi Utama
              </h2>
            </div>
            <a href="#katalog" className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1">
              <span>Buka Semua Katalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div 
              onClick={() => {
                setSelectedCategory('Kain');
                const el = document.getElementById('katalog');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="group cursor-pointer rounded-2xl border border-slate-200 bg-gradient-to-br from-teal-50/50 to-slate-50 p-6 hover:border-teal-400 hover:shadow-md transition"
            >
              <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center mb-4 shadow-sm shadow-teal-600/20">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-teal-700 transition">Kain Kaos &amp; Combed</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Katun Combed 30s &amp; 24s Reaktif warna pekat, Fleece PE tebal untuk hoodie/jaket, dan Baby Terry lembut.
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 mt-4">
                <span>Pilih Bahan Kain</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>

            <div 
              onClick={() => {
                setSelectedCategory('Kain');
                const el = document.getElementById('katalog');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="group cursor-pointer rounded-2xl border border-slate-200 bg-gradient-to-br from-indigo-50/50 to-slate-50 p-6 hover:border-indigo-400 hover:shadow-md transition"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center mb-4 shadow-sm shadow-indigo-600/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-700 transition">Kain Rayon &amp; Fashion</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Rayon Twill adem jatuh untuk kemeja &amp; daster, Rayon Crinkle Airflow untuk gamis dan hijab modern.
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-700 mt-4">
                <span>Lihat Koleksi Rayon</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>

            <div 
              onClick={() => {
                setSelectedCategory('Alat Konveksi');
                const el = document.getElementById('katalog');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="group cursor-pointer rounded-2xl border border-slate-200 bg-gradient-to-br from-teal-50/50 to-slate-50 p-6 hover:border-teal-400 hover:shadow-md transition"
            >
              <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center mb-4 shadow-sm shadow-teal-600/20">
                <Wrench className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-teal-700 transition">Peralatan &amp; Aksesoris Jahit</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Benang Astra 5000y grosir lusinan, gunting kodok besi 10 inch, jarum Organ industri, kancing, dan resleting YKK.
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 mt-4">
                <span>Pilih Alat Konveksi</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. DYNAMIC CATALOG SECTION (NO LAYOUT SHIFT / NO JUMP) */}
      <section id="katalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 flex-1 w-full scroll-mt-24">
        {/* Section Header */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-teal-700 uppercase tracking-wider block">
                Katalog Produk Terlengkap
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                Katalog Kain &amp; Alat Konveksi
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Pilih kebutuhan produksi konveksimu dan masukkan ke keranjang untuk order via WhatsApp resmi toko.
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

        {/* Product Grid with Stable Skeleton (Eliminates Jump In / Jump Out) */}
        <div className="mt-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 animate-pulse">
                  <div className="aspect-4/3 w-full bg-slate-200 rounded-xl" />
                  <div className="h-4 bg-slate-200 rounded w-1/3" />
                  <div className="h-5 bg-slate-200 rounded w-3/4" />
                  <div className="h-6 bg-slate-200 rounded w-1/2 pt-2" />
                  <div className="h-9 bg-slate-200 rounded-xl w-full" />
                </div>
              ))}
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
                Tidak ada produk yang sesuai dengan kata kunci &ldquo;{searchQuery}&rdquo;.
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

      {/* 5. CARA PEMESANAN / WORKFLOW SECTION */}
      <section className="bg-slate-100 py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-teal-700 uppercase tracking-wider block">
              Alur Order Praktis
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Cara Mudah Memesan di Gentina Jaya Textile
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Kemudahan bertransaksi langsung via WhatsApp tanpa ribet login atau proses checkout yang berbelit-belit.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative">
              <span className="w-8 h-8 rounded-full bg-teal-600 text-white font-black text-sm flex items-center justify-center mb-4">
                1
              </span>
              <h3 className="text-sm font-bold text-slate-900 mb-1.5">Pilih Bahan &amp; Alat</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Telusuri katalog kain (meter/roll) atau alat jahit, atur kuantiti, lalu tambahkan ke keranjang belanja.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative">
              <span className="w-8 h-8 rounded-full bg-teal-600 text-white font-black text-sm flex items-center justify-center mb-4">
                2
              </span>
              <h3 className="text-sm font-bold text-slate-900 mb-1.5">Isi Data Pemesan</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Buka keranjang belanja, masukkan Nama Anda, Nama Usaha Konveksi, dan Nomor WhatsApp aktif pemesan.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative">
              <span className="w-8 h-8 rounded-full bg-teal-600 text-white font-black text-sm flex items-center justify-center mb-4">
                3
              </span>
              <h3 className="text-sm font-bold text-slate-900 mb-1.5">Kirim Pesanan ke WA</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Sistem otomatis membuat ID transaksi unik dan membuka WhatsApp admin resmi dengan format pesanan yang rapi.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative">
              <span className="w-8 h-8 rounded-full bg-teal-600 text-white font-black text-sm flex items-center justify-center mb-4">
                4
              </span>
              <h3 className="text-sm font-bold text-slate-900 mb-1.5">Lacak &amp; Upload Bukti</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Lakukan transfer pembayaran, unggah bukti bayar di menu pelacakan, dan pantau resi pengiriman kargo Anda.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. TESTIMONI MITRA KONVEKSI */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-teal-700 uppercase tracking-wider block">
            Testimoni Pelanggan
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Dipercaya Oleh Ratusan Pengusaha Konveksi
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Simak pengalaman langsung para mitra garmen dan konveksi kaos yang berlangganan kain di Gentina Jaya Textile.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs text-slate-700 italic leading-relaxed">
              &ldquo;Sudah 6 bulan langganan Combed 30s roll di Gentina Jaya Textile untuk brand distro kami di Bandung. Warna hitam reaktifnya pekat dan stabil, gramasi pas, dan pengiriman kargonya selalu tepat waktu.&rdquo;
            </p>
            <div className="pt-2 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-900 block">Bpk. Haryono</span>
              <span className="text-[11px] text-teal-700 font-medium">Owner CV Sumber Berkah Konveksi (Bandung)</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs text-slate-700 italic leading-relaxed">
              &ldquo;Kain Rayon Twill dan Airflow-nya juara, adem dan jatuh sangat cocok untuk gamis muslimah. Fitur order WhatsApp dan tracking di webnya sangat memudahkan kami memantau pesanan tanpa ribet.&rdquo;
            </p>
            <div className="pt-2 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-900 block">Ibu Siti Nurhaliza</span>
              <span className="text-[11px] text-teal-700 font-medium">Founder Ratu Hijab &amp; Gamis Studio (Solo)</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs text-slate-700 italic leading-relaxed">
              &ldquo;Alat konveksinya sangat komplit. Dari benang Astra grosir lusinan, jarum Organ DBx1, sampai kancing kemeja ekspor kami selalu order di sini. Harganya sangat kompetitif untuk pengusaha kemeja seragam.&rdquo;
            </p>
            <div className="pt-2 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-900 block">Bpk. Dedi Kurniawan</span>
              <span className="text-[11px] text-teal-700 font-medium">Supervisor Produksi Mitra Tailor (Jakarta)</span>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FAQ (PERTANYAAN UMUM) */}
      <section className="bg-white py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-200">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-xs font-bold text-teal-700 uppercase tracking-wider block">
              Tanya Jawab
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Pertanyaan yang Sering Diajukan (FAQ)
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Jawaban cepat untuk pertanyaan umum seputar pembelian kain, alat konveksi, dan pengiriman.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div 
                key={idx} 
                className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/50 hover:border-teal-200 transition"
              >
                <button
                  type="button"
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-slate-900 cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>{faq.q}</span>
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${activeFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                {activeFaq === idx && (
                  <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed pt-1 border-t border-slate-100">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. FINAL CALL TO ACTION (CTA) BANNER */}
      <section className="bg-gradient-to-r from-teal-800 to-teal-900 text-white py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div className="space-y-2">
            <span className="text-xs font-bold text-teal-300 uppercase tracking-wider">
              Konsultasi Bahan &amp; Custom Order
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Siap Memulai Produksi Konveksi Anda?
            </h3>
            <p className="text-xs sm:text-sm text-teal-100 max-w-xl leading-relaxed">
              Dapatkan sample kain, konsultasi perhitungan kebutuhan meteran, dan harga spesial partai besar langsung dari tim spesialis Gentina Jaya Textile.
            </p>
          </div>

          <a
            href={`https://wa.me/${DEFAULT_ADMIN_WA}?text=Halo%20Admin%20Gentina%20Jaya%20Textile,%20saya%20ingin%20konsultasi%20pemesanan%20kain%20dan%20alat%20konveksi`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-teal-900 hover:bg-teal-50 font-bold text-sm shadow-xl transition shrink-0 cursor-pointer"
          >
            <MessageSquare className="w-4 h-4 text-teal-700" />
            <span>Hubungi WhatsApp Tim Ahli Kami</span>
            <ArrowRight className="w-4 h-4 ml-1 text-teal-700" />
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
