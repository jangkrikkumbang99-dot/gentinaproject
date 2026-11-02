'use client';

import React from 'react';
import Link from 'next/link';
import { CheckCircle2, MessageSquare, ArrowRight, ExternalLink, Copy, Check } from 'lucide-react';
import { formatRupiah } from '@/lib/utils';
import { useToast } from '@/context/ToastContext';

interface OrderSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  customerName: string;
  totalAmount: number;
  waUrl: string;
}

export default function OrderSuccessModal({
  isOpen,
  onClose,
  orderId,
  customerName,
  totalAmount,
  waUrl,
}: OrderSuccessModalProps) {
  const { info } = useToast();
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(orderId);
    setCopied(true);
    info('ID Transaksi berhasil disalin ke clipboard');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-teal-100 transform animate-in zoom-in-95 duration-200 text-center">
        {/* Success Icon */}
        <div className="w-16 h-16 bg-teal-100 text-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
          <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
        </div>

        <h3 className="text-xl sm:text-2xl font-black text-slate-900">
          Pesanan Berhasil Dicatat!
        </h3>
        <p className="text-sm text-slate-600 mt-1.5">
          Terima kasih <span className="font-semibold text-slate-900">{customerName}</span>. Pesanan Anda telah tersimpan di sistem kami dengan status <span className="text-teal-700 font-semibold">&ldquo;Menunggu Konfirmasi&rdquo;</span>.
        </p>

        {/* Order ID Box */}
        <div className="mt-5 p-4 rounded-2xl bg-teal-50 border border-teal-200/80 text-left flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wider block">
              Nomor Transaksi Unik
            </span>
            <span className="text-lg font-extrabold text-slate-900 tracking-wide font-mono">
              {orderId}
            </span>
            <span className="text-xs text-slate-500 block mt-0.5">
              Total: <strong className="text-teal-800">{formatRupiah(totalAmount)}</strong>
            </span>
          </div>
          <button
            onClick={handleCopyOrderId}
            className="p-2.5 rounded-xl bg-white hover:bg-teal-100 text-teal-700 border border-teal-200 transition shadow-xs flex items-center gap-1.5 text-xs font-semibold"
            title="Salin No Transaksi"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Tersalin' : 'Salin'}</span>
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 text-left space-y-1.5">
          <p className="font-semibold text-slate-800">Langkah Selanjutnya:</p>
          <p>1. Kirim pesan otomatis yang telah disiapkan ke WhatsApp Admin Gentina Jaya Textile.</p>
          <p>2. Admin akan memeriksa ketersediaan stok & menghitung ongkos kirim ke alamat Anda.</p>
          <p>3. Lakukan pembayaran dan unggah bukti transfer di menu <strong className="text-teal-700">Lacak Pesanan</strong>.</p>
        </div>

        {/* Buttons */}
        <div className="mt-6 space-y-2.5">
          {/* Open WA Again if popup was blocked */}
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/30 transition active:scale-98"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Buka Chat WhatsApp Sekarang</span>
            <ExternalLink className="w-3.5 h-3.5 ml-1" />
          </a>

          {/* Go to Tracking / Proof Upload */}
          <Link
            href={`/tracking?orderId=${encodeURIComponent(orderId)}`}
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 font-semibold text-sm border border-teal-200 transition"
          >
            <span>Lacak Status & Upload Bukti Bayar</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 text-xs text-slate-500 hover:text-slate-800 font-medium transition"
          >
            Tutup Dialog Ini
          </button>
        </div>
      </div>
    </div>
  );
}
