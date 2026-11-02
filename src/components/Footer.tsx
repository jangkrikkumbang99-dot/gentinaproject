import React from 'react';
import Link from 'next/link';
import { Layers, Phone, MapPin, Clock, MessageSquareQuote, Shield } from 'lucide-react';
import { STORE_NAME, STORE_SLOGAN, STORE_ADDRESS, STORE_OPERATING_HOURS, DEFAULT_ADMIN_WA } from '@/lib/constants';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center text-white shadow-md shadow-teal-500/30">
                <Layers className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">
                {STORE_NAME}
              </span>
            </div>
            <p className="text-sm text-teal-400 font-medium leading-relaxed italic">
              &ldquo;{STORE_SLOGAN}&rdquo;
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Distributor resmi kain berkualitas tinggi untuk kebutuhan garmen, konveksi kaos, hijab, kemeja, serta perlengkapan jahit industri terlengkap.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Katalog & Kategori
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/?category=Kain" className="hover:text-teal-400 transition">
                  Kain Katun Combed (Roll & Ecer)
                </Link>
              </li>
              <li>
                <Link href="/?category=Kain" className="hover:text-teal-400 transition">
                  Kain Rayon Twill & Airflow
                </Link>
              </li>
              <li>
                <Link href="/?category=Alat+Konveksi" className="hover:text-teal-400 transition">
                  Benang Jahit Astra & Obras
                </Link>
              </li>
              <li>
                <Link href="/?category=Alat+Konveksi" className="hover:text-teal-400 transition">
                  Gunting Kodok & Jarum Organ
                </Link>
              </li>
              <li>
                <Link href="/?category=Alat+Konveksi" className="hover:text-teal-400 transition">
                  Kancing, Resleting & Karet
                </Link>
              </li>
            </ul>
          </div>

          {/* Layanan Pelanggan */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Layanan Pelanggan
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/tracking" className="hover:text-teal-400 transition flex items-center gap-1.5">
                  <span>Lacak Pesanan WhatsApp</span>
                </Link>
              </li>
              <li>
                <Link href="/tracking" className="hover:text-teal-400 transition">
                  Upload Bukti Transfer Pembayaran
                </Link>
              </li>
              <li>
                <a
                  href={`https://wa.me/${DEFAULT_ADMIN_WA}?text=Halo%20Admin%20Gentina%20Jaya%20Textile,%20saya%20ingin%20konsultasi%20bahan%20kain`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-teal-400 transition flex items-center gap-1"
                >
                  <MessageSquareQuote className="w-3.5 h-3.5 text-teal-400" />
                  Konsultasi Kain & Sampel
                </a>
              </li>
              <li>
                <Link href="/admin" className="hover:text-teal-400 transition flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-slate-500" />
                  Login Staf & Pengelola Toko
                </Link>
              </li>
            </ul>
          </div>

          {/* Kontak & Lokasi */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Kontak & Operasional
            </h4>
            <div className="space-y-2.5 text-xs text-slate-400 leading-relaxed">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <span>{STORE_ADDRESS}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-400 shrink-0" />
                <span>{STORE_OPERATING_HOURS}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-teal-400 shrink-0" />
                <a
                  href={`https://wa.me/${DEFAULT_ADMIN_WA}`}
                  className="text-teal-400 hover:underline font-semibold"
                >
                  +{DEFAULT_ADMIN_WA} (Official WA)
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>
            &copy; 2026 {STORE_NAME}. Seluruh Hak Cipta Dilindungi.
          </p>
          <p className="text-slate-400">
            Kain & Alat Konveksi Berkualitas • Solusi Tepat Bisnis Garmen Anda
          </p>
        </div>
      </div>
    </footer>
  );
}
