'use client';

import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  Send, 
  Building2, 
  User, 
  Phone, 
  FileText,
  Loader2,
  Sparkles
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { 
  formatRupiah, 
  generateOrderId, 
  formatPhoneNumber, 
  buildWhatsAppOrderMessage, 
  createWhatsAppUrl 
} from '@/lib/utils';
import { DEFAULT_ADMIN_WA } from '@/lib/constants';
import { OrderItem } from '@/types/database';
import OrderSuccessModal from './OrderSuccessModal';

export default function CartDrawer() {
  const { 
    cart, 
    isCartOpen, 
    setIsCartOpen, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    totalItems, 
    subtotal 
  } = useCart();
  
  const { success, error, info } = useToast();

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [storeName, setStoreName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Success Modal State
  const [successData, setSuccessData] = useState<{
    orderId: string;
    customerName: string;
    totalAmount: number;
    waUrl: string;
  } | null>(null);

  if (!isCartOpen) return null;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cart.length === 0) {
      error('Keranjang belanja masih kosong!');
      return;
    }

    if (!customerName.trim()) {
      error('Mohon isi Nama Pemesan');
      return;
    }

    if (!phoneNumber.trim()) {
      error('Mohon isi Nomor WhatsApp aktif pemesan');
      return;
    }

    const cleanPhone = formatPhoneNumber(phoneNumber);
    if (cleanPhone.length < 9) {
      error('Format nomor WhatsApp tidak valid. Masukkan nomor yang benar (contoh: 081234567890)');
      return;
    }

    setIsSubmitting(true);
    const orderId = generateOrderId();

    // Map cart items into OrderItem format
    const orderDetails: OrderItem[] = cart.map((item) => ({
      product_id: item.product.id,
      name: item.product.name,
      category: item.product.category,
      unit: item.product.unit,
      price: item.product.price,
      quantity: item.quantity,
      subtotal: item.product.price * item.quantity,
      image_url: item.product.image_url,
    }));

    try {
      let customerId: string | null = null;

      // 1. Check / Save Customer in Supabase if configured
      if (isSupabaseConfigured()) {
        try {
          // Check if customer exists by phone_number
          const { data: existingCustomer, error: searchError } = await supabase
            .from('customers')
            .select('id, name, store_name')
            .eq('phone_number', cleanPhone)
            .maybeSingle();

          if (existingCustomer) {
            customerId = existingCustomer.id;
            // Optionally update store_name if provided
            if (storeName && !existingCustomer.store_name) {
              await supabase
                .from('customers')
                .update({ store_name: storeName.trim() })
                .eq('id', customerId);
            }
          } else {
            // Insert new customer
            const { data: newCustomer, error: insertCustError } = await supabase
              .from('customers')
              .insert({
                name: customerName.trim(),
                store_name: storeName.trim() || null,
                phone_number: cleanPhone,
                notes: notes.trim() || null,
              })
              .select('id')
              .single();

            if (!insertCustError && newCustomer) {
              customerId = newCustomer.id;
            }
          }

          // 2. Insert Order into Supabase
          const { error: insertOrderError } = await supabase
            .from('orders')
            .insert({
              id: orderId,
              customer_id: customerId,
              order_details: orderDetails,
              total_amount: subtotal,
              payment_status: 'Menunggu Konfirmasi',
              proof_image_url: null,
            });

          if (insertOrderError) {
            console.warn('Failed to insert order to Supabase:', insertOrderError);
          }
        } catch (dbErr) {
          console.error('Database operation failed:', dbErr);
          // Non-blocking: proceed to WhatsApp checkout so order is never lost
        }
      } else {
        // Fallback for demo / preview without Supabase credentials:
        // Save to localStorage for client-side tracking demonstration
        try {
          const localOrders = JSON.parse(localStorage.getItem('gentina_offline_orders') || '[]');
          localOrders.unshift({
            id: orderId,
            customer_id: 'local-cust',
            order_details: orderDetails,
            total_amount: subtotal,
            payment_status: 'Menunggu Konfirmasi',
            proof_image_url: null,
            created_at: new Date().toISOString(),
            customer: {
              id: 'local-cust',
              name: customerName.trim(),
              store_name: storeName.trim() || null,
              phone_number: cleanPhone,
              notes: notes.trim() || null,
            }
          });
          localStorage.setItem('gentina_offline_orders', JSON.stringify(localOrders));
        } catch (e) {
          console.error(e);
        }
      }

      // 3. Construct WhatsApp Message & URL
      const adminWa = process.env.NEXT_PUBLIC_ADMIN_WA || DEFAULT_ADMIN_WA;
      const waMessage = buildWhatsAppOrderMessage({
        orderId,
        customerName: customerName.trim(),
        storeName: storeName.trim() || undefined,
        phoneNumber: cleanPhone,
        items: orderDetails,
        totalAmount: subtotal,
        notes: notes.trim() || undefined,
      });

      const waUrl = createWhatsAppUrl(adminWa, waMessage);

      // Open WhatsApp in new tab
      window.open(waUrl, '_blank');

      // Clear cart
      clearCart();
      setIsCartOpen(false);

      // Show Success Modal
      setSuccessData({
        orderId,
        customerName: customerName.trim(),
        totalAmount: subtotal,
        waUrl,
      });

      success('Pesanan berhasil dibuat! Anda dialihkan ke WhatsApp Admin.');
    } catch (err: unknown) {
      console.error('Checkout error:', err);
      error('Terjadi kesalahan saat memproses pesanan. Silakan coba kembali.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <div
          onClick={() => setIsCartOpen(false)}
          className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        />

        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col h-full transform animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-teal-100 text-teal-700 rounded-xl">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Keranjang Belanja
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    {totalItems} item produk terpilih
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
                aria-label="Tutup keranjang"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {cart.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-sm">
                    Keranjang Belanja Masih Kosong
                  </h3>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Pilih kain atau alat konveksi dari katalog kami untuk memulai pemesanan.
                  </p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 text-white font-semibold text-xs shadow-sm"
                  >
                    Mulai Belanja
                  </button>
                </div>
              ) : (
                <>
                  {/* Cart Item List */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500 pb-1 border-b border-slate-100">
                      <span>Daftar Item</span>
                      <button
                        onClick={clearCart}
                        className="text-rose-500 hover:text-rose-700 transition"
                      >
                        Kosongkan Keranjang
                      </button>
                    </div>

                    {cart.map((item) => (
                      <div
                        key={item.product.id}
                        className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/50 hover:bg-white hover:border-teal-200 transition space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                              {item.product.category} • {item.product.unit}
                            </span>
                            <h4 className="font-bold text-slate-900 text-xs mt-1 leading-snug">
                              {item.product.name}
                            </h4>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {formatRupiah(item.product.price)} / {item.product.unit}
                            </p>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-slate-400 hover:text-rose-600 transition p-1"
                            title="Hapus dari keranjang"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                          {/* Stepper */}
                          <div className="flex items-center border border-slate-200 rounded-lg bg-white">
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="p-1 text-slate-600 hover:bg-slate-100 rounded-l transition"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-8 text-center text-xs font-bold text-slate-800">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="p-1 text-slate-600 hover:bg-slate-100 rounded-r transition"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Subtotal */}
                          <div className="text-right">
                            <span className="text-xs font-black text-teal-800">
                              {formatRupiah(item.product.price * item.quantity)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Customer Information Form */}
                  <form id="order-form" onSubmit={handleSubmitOrder} className="space-y-4 pt-2 border-t border-slate-200">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                      <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                      <span>Formulir Identitas Pemesan</span>
                    </div>

                    {/* Customer Name */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Nama Pemesan <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          required
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="Contoh: Bpk. Haryono"
                          className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
                        />
                      </div>
                    </div>

                    {/* Store / Konveksi Name */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Nama Toko / Usaha Konveksi <span className="text-slate-400 font-normal">(opsional)</span>
                      </label>
                      <div className="relative">
                        <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          value={storeName}
                          onChange={(e) => setStoreName(e.target.value)}
                          placeholder="Contoh: CV Berkah Jaya Konveksi"
                          className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
                        />
                      </div>
                    </div>

                    {/* WhatsApp Number */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Nomor WhatsApp Aktif <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="tel"
                          required
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="Contoh: 081234567890"
                          className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Admin akan mengonfirmasi ketersediaan barang dan total pembayaran ke nomor ini.
                      </p>
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Catatan Pesanan <span className="text-slate-400 font-normal">(opsional)</span>
                      </label>
                      <div className="relative">
                        <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <textarea
                          rows={2}
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Contoh: Request warna hitam reaktif, potong kelipatan 5 meter, dsb."
                          className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white resize-none"
                        />
                      </div>
                    </div>
                  </form>
                </>
              )}
            </div>

            {/* Bottom Checkout Footer */}
            {cart.length > 0 && (
              <div className="p-5 border-t border-slate-200 bg-slate-50 space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Total Item Belanja:</span>
                    <span className="font-semibold text-slate-800">{totalItems} item</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold text-slate-900">Estimasi Subtotal:</span>
                    <span className="font-extrabold text-teal-700 text-lg">
                      {formatRupiah(subtotal)}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    *Belum termasuk estimasi ongkos kirim cargo / ekspedisi yang akan dihitung oleh admin.
                  </p>
                </div>

                <button
                  type="submit"
                  form="order-form"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white font-bold text-sm shadow-md shadow-teal-600/30 transition active:scale-98 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Menyimpan Pesanan...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Kirim Pesanan ke WhatsApp</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {successData && (
        <OrderSuccessModal
          isOpen={true}
          onClose={() => setSuccessData(null)}
          orderId={successData.orderId}
          customerName={successData.customerName}
          totalAmount={successData.totalAmount}
          waUrl={successData.waUrl}
        />
      )}
    </>
  );
}
