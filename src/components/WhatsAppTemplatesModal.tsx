'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare, ExternalLink, X, Send, Sparkles, Copy, Check } from 'lucide-react';
import { Customer, Order } from '@/types/database';
import { formatRupiah, createWhatsAppUrl, formatPhoneNumber } from '@/lib/utils';
import { STORE_NAME } from '@/lib/constants';
import { useToast } from '@/context/ToastContext';

interface WhatsAppTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  order?: Order | null;
  customer?: Customer | null;
}

export default function WhatsAppTemplatesModal({
  isOpen,
  onClose,
  order,
  customer,
}: WhatsAppTemplatesModalProps) {
  const { info } = useToast();
  const [selectedTemplateKey, setSelectedTemplateKey] = useState<string>('greeting');
  const [customMessage, setCustomMessage] = useState<string>('');
  const [resiNumber, setResiNumber] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  // Derive target data
  const targetName = customer?.name || order?.customer?.name || 'Pelanggan';
  const targetStore = customer?.store_name || order?.customer?.store_name || '';
  const targetPhone = customer?.phone_number || order?.customer?.phone_number || '';
  const orderId = order?.id || 'GJT-XXXXX';
  const totalAmount = order?.total_amount ? formatRupiah(order.total_amount) : 'Rp 0';

  // Templates
  const templates: Record<string, { title: string; build: () => string }> = {
    greeting: {
      title: 'Sapaan & Konfirmasi Pesanan',
      build: () =>
        `Halo Kak ${targetName}${targetStore ? ` (${targetStore})` : ''}, kami dari Admin ${STORE_NAME}.\n\nPesanan Kakak dengan No. Transaksi *${orderId}* senilai *${totalAmount}* telah kami terima di sistem kami.\n\nBerikut rekening resmi kami untuk proses pembayaran:\n💳 BCA: 123-456-7890 a/n Gentina Jaya Textile\n💳 Mandiri: 987-000-123456 a/n Gentina Jaya Textile\n\nSetelah transfer, mohon kirimkan bukti pembayaran di sini atau unggah melalui halaman pelacakan kami ya Kak. Terima kasih! 🙏`,
    },
    payment_received: {
      title: 'Konfirmasi Pembayaran & Proses Siap',
      build: () =>
        `Terima kasih Kak ${targetName}${targetStore ? ` (${targetStore})` : ''}!\n\nPembayaran untuk pesanan *${orderId}* telah kami verifikasi dan masuk ke rekening kami.\nSaat ini kain/alat konveksi pesanan Kakak sedang masuk antrean proses potong, ukur, dan packing rapi oleh tim gudang kami.\n\nKami akan update kembali begitu pesanan siap dikirim ya Kak. Terima kasih atas kepercayaannya pada ${STORE_NAME}! ✨`,
    },
    shipping_update: {
      title: 'Update Pengiriman & No. Resi',
      build: () =>
        `Halo Kak ${targetName}!\n\nKabar baik, pesanan kain/alat konveksi Kakak *${orderId}* telah selesai dikemas dan diserahkan ke pihak ekspedisi/cargo.\n\n📦 Ekspedisi: Dakota Cargo / Indah Cargo / J&T Cargo\n🚚 No. Resi: *${resiNumber || '[MASUKKAN_NO_RESI]'}*\n\nEstimasi barang sampai 2-4 hari kerja tergantung rute pengiriman. Semoga lancar usahanya dan kami nantikan repeat order berikutnya! 🙏`,
    },
    order_completed: {
      title: 'Pesanan Selesai & Terima Kasih',
      build: () =>
        `Halo Kak ${targetName}${targetStore ? ` (${targetStore})` : ''},\n\nPesanan Kakak *${orderId}* tercatat telah selesai dan diterima.\nTerima kasih banyak telah mempercayakan kebutuhan konveksi Anda pada ${STORE_NAME}.\n\nJika ada kebutuhan bahan kain (Combed, Rayon, Fleece) atau alat konveksi tambahan, jangan ragu untuk menghubungi kami kembali ya Kak! 🧵✨`,
    },
    promo_new_fabric: {
      title: 'Penawaran Bahan Baru / Promo Konveksi',
      build: () =>
        `Halo Kak ${targetName}${targetStore ? ` (${targetStore})` : ''}, salam sukses dari ${STORE_NAME}! 👋\n\nMau menginfokan bahwa minggu ini kami baru saja restock *Kain Katun Combed 30s Reaktif* dan *Rayon Twill* dengan grade premium serta pilihan warna baru yang sangat cocok untuk produksi garmen Kakak.\n\nTersedia harga spesial khusus pelanggan setia kami untuk pengambilan partai roll. Apakah Kakak sedang ada rencana produksi baru dalam waktu dekat? Kami siap kirimkan katalog warna terbarunya! 😊`,
    },
  };

  useEffect(() => {
    if (templates[selectedTemplateKey]) {
      setCustomMessage(templates[selectedTemplateKey].build());
    }
  }, [selectedTemplateKey, resiNumber, targetName, targetStore, orderId, totalAmount]);

  if (!isOpen) return null;

  const handleOpenWhatsApp = () => {
    if (!targetPhone) {
      alert('Nomor WhatsApp pelanggan tidak ditemukan');
      return;
    }
    const url = createWhatsAppUrl(targetPhone, customMessage);
    window.open(url, '_blank');
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(customMessage);
    setCopied(true);
    info('Pesan disalin ke clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-100 text-teal-700">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Quick Follow-Up WhatsApp
              </h3>
              <p className="text-xs text-slate-500">
                Kirim pesan resmi ke: <strong className="text-slate-800">{targetName}</strong> ({targetPhone || 'Tidak ada no WA'})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Template Selector Pills */}
        <div className="pt-4 flex-1 overflow-y-auto space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Pilih Template Respon Cepat:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Object.entries(templates).map(([key, t]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedTemplateKey(key)}
                  className={`p-2.5 rounded-xl text-left text-xs font-semibold border transition ${
                    selectedTemplateKey === key
                      ? 'bg-teal-50 text-teal-800 border-teal-300 ring-1 ring-teal-300'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {t.title}
                </button>
              ))}
            </div>
          </div>

          {selectedTemplateKey === 'shipping_update' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nomor Resi Pengiriman
              </label>
              <input
                type="text"
                value={resiNumber}
                onChange={(e) => setResiNumber(e.target.value)}
                placeholder="Contoh: DKT-9988221773"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          )}

          {/* Editable Text Area */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Isi Pesan WhatsApp (Dapat diedit langsung):
              </label>
              <button
                type="button"
                onClick={handleCopyText}
                className="text-[11px] font-medium text-teal-700 hover:text-teal-900 flex items-center gap-1"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Tersalin' : 'Salin Pesan'}</span>
              </button>
            </div>
            <textarea
              rows={7}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="w-full p-3 text-xs font-mono rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50 leading-relaxed"
            />
          </div>
        </div>

        {/* Footer Action */}
        <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleOpenWhatsApp}
            disabled={!targetPhone}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition active:scale-98 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Kirim via WhatsApp (+{formatPhoneNumber(targetPhone)})</span>
            <ExternalLink className="w-3 h-3 ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
