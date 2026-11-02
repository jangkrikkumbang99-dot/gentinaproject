'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ShoppingBag, 
  ShieldCheck, 
  Layers, 
  Search, 
  Menu, 
  X, 
  PhoneCall, 
  Truck,
  Sparkles
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { STORE_NAME, STORE_SLOGAN, DEFAULT_ADMIN_WA } from '@/lib/constants';

export default function Header() {
  const pathname = usePathname();
  const { totalItems, setIsCartOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top Banner Announcement */}
      <div className="bg-gradient-to-r from-teal-700 via-teal-600 to-teal-700 text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="w-3.5 h-3.5 text-teal-200" />
            <span className="font-medium truncate">
              Distributor Resmi Kain & Alat Konveksi • Pengiriman Cepat ke Seluruh Indonesia
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-teal-100">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-teal-300" /> Kualitas Grade A Terjamin
            </span>
            <a
              href={`https://wa.me/${DEFAULT_ADMIN_WA}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition flex items-center gap-1 font-semibold"
            >
              <PhoneCall className="w-3 h-3" /> WA Admin: +{DEFAULT_ADMIN_WA}
            </a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Slogan */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform duration-200">
              <Layers className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-teal-600 transition-colors">
                {STORE_NAME}
              </span>
              <span className="text-xs text-teal-700 font-medium hidden sm:inline-block">
                {STORE_SLOGAN}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                pathname === '/'
                  ? 'text-teal-600 bg-teal-50'
                  : 'text-slate-600 hover:text-teal-600 hover:bg-slate-50'
              }`}
            >
              Katalog Produk
            </Link>
            <Link
              href="/tracking"
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-1.5 ${
                pathname === '/tracking'
                  ? 'text-teal-600 bg-teal-50'
                  : 'text-slate-600 hover:text-teal-600 hover:bg-slate-50'
              }`}
            >
              <Search className="w-4 h-4 text-teal-600" />
              Lacak Pesanan
            </Link>
          </nav>

          {/* Action Buttons: Cart & Admin Switch */}
          <div className="flex items-center gap-3">
            {/* Cart Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 px-3.5 py-2 rounded-xl bg-teal-50 hover:bg-teal-100/80 text-teal-800 transition font-medium border border-teal-200/60 shadow-xs active:scale-95"
              aria-label="Keranjang Belanja"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5 text-teal-700" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-bounce shadow-xs">
                    {totalItems}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline-block text-sm font-semibold">
                Keranjang
              </span>
            </button>

            {/* Admin Switch / Login */}
            <Link
              href="/admin"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition active:scale-95"
            >
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>Panel Admin</span>
            </Link>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-5 space-y-2 animate-in slide-in-from-top-2 duration-150">
          <p className="text-xs font-medium text-teal-700 px-2 pb-1 border-b border-slate-100">
            {STORE_SLOGAN}
          </p>
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2.5 rounded-lg text-sm font-semibold ${
              pathname === '/' ? 'bg-teal-50 text-teal-700' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            Katalog Produk (Kain & Alat Konveksi)
          </Link>
          <Link
            href="/tracking"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold ${
              pathname === '/tracking' ? 'bg-teal-50 text-teal-700' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Search className="w-4 h-4 text-teal-600" />
            Lacak Pesanan & Upload Bukti Bayar
          </Link>
          <div className="pt-2 border-t border-slate-100">
            <a
              href={`https://wa.me/${DEFAULT_ADMIN_WA}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-teal-600 text-white font-medium text-sm shadow-sm"
            >
              <PhoneCall className="w-4 h-4" /> Hubungi WhatsApp Toko
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
