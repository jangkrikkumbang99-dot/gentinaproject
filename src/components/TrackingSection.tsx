'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Search, 
  Phone, 
  UploadCloud, 
  CheckCircle2, 
  Clock, 
  Package, 
  FileCheck, 
  AlertCircle,
  Eye,
  Loader2,
  Calendar,
  Layers,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { supabase, isSupabaseConfigured, uploadMediaFile } from '@/lib/supabase';
import { formatRupiah, formatDate, formatPhoneNumber } from '@/lib/utils';
import { Order, PaymentStatus } from '@/types/database';
import { useToast } from '@/context/ToastContext';

export default function TrackingSection() {
  const searchParams = useSearchParams();
  const initialOrderId = searchParams.get('orderId') || '';
  
  const [query, setQuery] = useState(initialOrderId);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [uploadingOrderId, setUploadingOrderId] = useState<string | null>(null);
  const [selectedProofUrl, setSelectedProofUrl] = useState<string | null>(null);

  const { success, error, info } = useToast();

  const handleSearch = useCallback(async (searchQuery = query) => {
    if (!searchQuery.trim()) {
      error('Masukkan nomor WhatsApp atau ID Transaksi untuk melacak pesanan');
      return;
    }

    setLoading(true);
    setSearched(true);
    const cleanInput = searchQuery.trim();

    try {
      if (isSupabaseConfigured()) {
        const cleanPhone = formatPhoneNumber(cleanInput);

        // First attempt: search by Order ID
        let { data: ordersById, error: errById } = await supabase
          .from('orders')
          .select(`
            *,
            customer:customers(id, name, store_name, phone_number, notes)
          `)
          .ilike('id', `%${cleanInput}%`)
          .order('created_at', { ascending: false });

        if (!errById && ordersById && ordersById.length > 0) {
          setOrders(ordersById as Order[]);
          setLoading(false);
          return;
        }

        // Second attempt: search by phone number in customers table
        const { data: customerData } = await supabase
          .from('customers')
          .select('id')
          .ilike('phone_number', `%${cleanPhone}%`);

        if (customerData && customerData.length > 0) {
          const customerIds = customerData.map((c) => c.id);
          const { data: ordersByCustomer, error: errCust } = await supabase
            .from('orders')
            .select(`
              *,
              customer:customers(id, name, store_name, phone_number, notes)
            `)
            .in('customer_id', customerIds)
            .order('created_at', { ascending: false });

          if (!errCust && ordersByCustomer) {
            setOrders(ordersByCustomer as Order[]);
            setLoading(false);
            return;
          }
        }

        setOrders([]);
      } else {
        // Fallback to local storage for offline demo
        const offlineOrders: Order[] = JSON.parse(localStorage.getItem('gentina_offline_orders') || '[]');
        const cleanPhone = formatPhoneNumber(cleanInput);
        const matched = offlineOrders.filter(
          (o) =>
            o.id.toLowerCase().includes(cleanInput.toLowerCase()) ||
            (o.customer?.phone_number && o.customer.phone_number.includes(cleanPhone))
        );
        setOrders(matched);
      }
    } catch (err) {
      console.error('Search error:', err);
      error('Gagal mengambil data pesanan. Periksa koneksi internet.');
    } finally {
      setLoading(false);
    }
  }, [query, error]);

  // Auto search if orderId param exists on mount
  useEffect(() => {
    if (initialOrderId) {
      setQuery(initialOrderId);
      handleSearch(initialOrderId);
    }
  }, [initialOrderId, handleSearch]);

  // Handle Proof Upload
  const handleFileUpload = async (orderId: string, file: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      error('Mohon pilih file gambar (JPG, PNG, WEBP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      error('Ukuran gambar maksimal 5 MB');
      return;
    }

    setUploadingOrderId(orderId);
    info('Mengunggah bukti transfer...');

    try {
      const publicUrl = await uploadMediaFile(file, 'proofs');

      if (isSupabaseConfigured()) {
        const { error: updateError } = await supabase
          .from('orders')
          .update({
            proof_image_url: publicUrl,
            payment_status: 'Menunggu Verifikasi Pembayaran',
          })
          .eq('id', orderId);

        if (updateError) throw updateError;
      } else {
        // Update local storage
        const offlineOrders: Order[] = JSON.parse(localStorage.getItem('gentina_offline_orders') || '[]');
        const updated = offlineOrders.map((o) =>
          o.id === orderId
            ? { ...o, proof_image_url: publicUrl, payment_status: 'Menunggu Verifikasi Pembayaran' as PaymentStatus }
            : o
        );
        localStorage.setItem('gentina_offline_orders', JSON.stringify(updated));
      }

      // Update state locally
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? {
                ...o,
                proof_image_url: publicUrl,
                payment_status: 'Menunggu Verifikasi Pembayaran' as PaymentStatus,
              }
            : o
        )
      );

      success('Bukti transfer berhasil diunggah! Status pesanan diperbarui.');
    } catch (err: unknown) {
      console.error('Upload proof error:', err);
      error('Gagal mengunggah bukti transfer. Coba beberapa saat lagi.');
    } finally {
      setUploadingOrderId(null);
    }
  };

  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'Menunggu Konfirmasi':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Menunggu Konfirmasi
          </span>
        );
      case 'Menunggu Verifikasi Pembayaran':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-800 border border-sky-200">
            <FileCheck className="w-3.5 h-3.5 text-sky-600" />
            Bukti Menunggu Verifikasi
          </span>
        );
      case 'Diproses':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200">
            <Package className="w-3.5 h-3.5 text-teal-600 animate-pulse" />
            Sedang Diproses (Potong / Kemas)
          </span>
        );
      case 'Selesai':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Pesanan Selesai / Terkirim
          </span>
        );
      case 'Dibatalkan':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            Pesanan Dibatalkan
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Title Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm text-center mb-8">
        <div className="w-14 h-14 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-teal-100 shadow-xs">
          <Search className="w-7 h-7" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Lacak Status Pesanan & Upload Bukti Bayar
        </h1>
        <p className="text-sm text-slate-500 max-w-xl mx-auto mt-2">
          Masukkan Nomor WhatsApp yang Anda gunakan saat pemesanan atau No. Transaksi unik Anda (contoh: GJT-20261102-XXXX).
        </p>

        {/* Search Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="mt-6 max-w-xl mx-auto flex flex-col sm:flex-row gap-2"
        >
          <div className="relative flex-1">
            <Phone className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Nomor WhatsApp (0812...) atau No. Transaksi"
              className="w-full pl-11 pr-4 py-3 text-sm rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50/50"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white font-bold text-sm shadow-md shadow-teal-600/30 transition active:scale-98 cursor-pointer"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>Lacak Pesanan</span>
          </button>
        </form>
      </div>

      {/* Results Section */}
      {loading ? (
        <div className="text-center py-12 space-y-3">
          <Loader2 className="w-10 h-10 text-teal-600 animate-spin mx-auto" />
          <p className="text-sm text-slate-500 font-medium">Mencari data transaksi Anda di sistem...</p>
        </div>
      ) : searched && orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-3">
          <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Tidak Ditemukan Pesanan</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Tidak ada pesanan yang cocok dengan kata kunci &ldquo;{query}&rdquo;. Pastikan nomor WhatsApp atau ID transaksi sesuai saat pemesanan.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden hover:border-teal-200 transition"
            >
              {/* Header Card */}
              <div className="p-5 sm:p-6 bg-slate-50/70 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-base text-slate-900">
                      {order.id}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(order.created_at)}
                    </span>
                  </div>
                  {order.customer && (
                    <div className="text-xs text-slate-600 mt-1">
                      Pemesan: <strong className="text-slate-900">{order.customer.name}</strong>
                      {order.customer.store_name && (
                        <span> ({order.customer.store_name})</span>
                      )}
                    </div>
                  )}
                </div>
                <div>{getStatusBadge(order.payment_status)}</div>
              </div>

              {/* Items List */}
              <div className="p-5 sm:p-6 space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Rincian Barang yang Dipesan
                  </h4>
                  <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
                    {order.order_details.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-white flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xs shrink-0">
                            {idx + 1}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">
                              {item.name}
                            </span>
                            <span className="text-slate-500 text-[11px]">
                              {item.quantity} {item.unit} x {formatRupiah(item.price)}
                            </span>
                          </div>
                        </div>
                        <span className="font-bold text-slate-800">
                          {formatRupiah(item.subtotal)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total Summary */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-sm font-bold text-slate-800">Total Nominal Belanja</span>
                  <span className="text-lg font-black text-teal-700">
                    {formatRupiah(order.total_amount)}
                  </span>
                </div>

                {/* Proof Section */}
                <div className="mt-4 p-4 rounded-2xl bg-teal-50/50 border border-teal-100">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h5 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <UploadCloud className="w-4 h-4 text-teal-600" />
                        Bukti Pembayaran / Transfer
                      </h5>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Unggah struk ATM / screenshot m-banking untuk mempercepat proses verifikasi pesanan.
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      {order.proof_image_url ? (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedProofUrl(order.proof_image_url)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-teal-700 border border-teal-200 text-xs font-bold hover:bg-teal-50 transition shadow-xs"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Lihat Bukti</span>
                          </button>
                          <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 transition cursor-pointer shadow-xs">
                            <span>Ganti File</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) handleFileUpload(order.id, f);
                              }}
                            />
                          </label>
                        </div>
                      ) : (
                        <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 transition cursor-pointer shadow-sm shadow-teal-600/30">
                          {uploadingOrderId === order.id ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Mengunggah...</span>
                            </>
                          ) : (
                            <>
                              <UploadCloud className="w-4 h-4" />
                              <span>Upload Bukti Transfer</span>
                            </>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            disabled={uploadingOrderId === order.id}
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) handleFileUpload(order.id, f);
                            }}
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  {order.proof_image_url && (
                    <div className="mt-3 flex items-center gap-3 bg-white p-2.5 rounded-xl border border-teal-100">
                      <img
                        src={order.proof_image_url}
                        alt="Bukti Transfer"
                        className="w-12 h-12 object-cover rounded-lg border border-slate-200 cursor-pointer"
                        onClick={() => setSelectedProofUrl(order.proof_image_url)}
                      />
                      <div className="flex-1">
                        <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Bukti Pembayaran Tersimpan
                        </span>
                        <span className="text-[10px] text-slate-400 block truncate max-w-xs">
                          {order.proof_image_url}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Proof Preview Modal */}
      {selectedProofUrl && (
        <div
          onClick={() => setSelectedProofUrl(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-5 max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="font-bold text-slate-900 text-sm">Preview Bukti Transfer</h4>
              <button
                onClick={() => setSelectedProofUrl(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                Tutup
              </button>
            </div>
            <div className="p-2 flex-1 overflow-auto flex items-center justify-center">
              <img
                src={selectedProofUrl}
                alt="Bukti Transfer Full"
                className="max-w-full max-h-[70vh] object-contain rounded-xl"
              />
            </div>
            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <a
                href={selectedProofUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-teal-700 font-bold hover:underline"
              >
                <span>Buka Gambar Asli</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
