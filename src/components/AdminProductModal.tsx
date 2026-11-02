'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  UploadCloud, 
  Layers, 
  Wrench, 
  DollarSign, 
  Check, 
  Clock, 
  Loader2, 
  Image as ImageIcon 
} from 'lucide-react';
import { Product, ProductCategory, ProductUnit } from '@/types/database';
import { supabase, isSupabaseConfigured, uploadMediaFile } from '@/lib/supabase';
import { PRODUCT_UNITS } from '@/lib/constants';
import { useToast } from '@/context/ToastContext';

interface AdminProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null; // null means create mode
  onSuccess: (savedProduct: Product) => void;
}

export default function AdminProductModal({
  isOpen,
  onClose,
  product,
  onSuccess,
}: AdminProductModalProps) {
  const { success, error, info } = useToast();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Kain');
  const [unit, setUnit] = useState<string>('roll');
  const [price, setPrice] = useState<string>('');
  const [isReady, setIsReady] = useState(true);
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setCategory(product.category);
      setUnit(product.unit);
      setPrice(String(product.price));
      setIsReady(product.is_ready);
      setImageUrl(product.image_url || '');
      setPreviewUrl(product.image_url || '');
      setImageFile(null);
    } else {
      // Reset form
      setName('');
      setCategory('Kain');
      setUnit('roll');
      setPrice('');
      setIsReady(true);
      setImageUrl('');
      setPreviewUrl('');
      setImageFile(null);
    }
  }, [product, isOpen]);

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        error('File harus berupa gambar (JPG, PNG, WEBP)');
        return;
      }
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      error('Nama produk wajib diisi');
      return;
    }

    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice < 0) {
      error('Harga produk tidak valid');
      return;
    }

    setSaving(true);

    try {
      let finalImageUrl = imageUrl;

      // Upload file to Supabase storage if selected
      if (imageFile) {
        info('Mengunggah foto produk...');
        finalImageUrl = await uploadMediaFile(imageFile, 'products');
      }

      const payload = {
        name: name.trim(),
        category,
        unit,
        price: numPrice,
        is_ready: isReady,
        image_url: finalImageUrl || null,
      };

      if (isSupabaseConfigured()) {
        if (product) {
          // Update
          const { data, error: updateErr } = await supabase
            .from('products')
            .update(payload)
            .eq('id', product.id)
            .select()
            .single();

          if (updateErr) throw updateErr;
          success(`Produk "${payload.name}" berhasil diperbarui.`);
          onSuccess(data as Product);
        } else {
          // Create
          const { data, error: insertErr } = await supabase
            .from('products')
            .insert(payload)
            .select()
            .single();

          if (insertErr) throw insertErr;
          success(`Produk "${payload.name}" berhasil ditambahkan ke katalog.`);
          onSuccess(data as Product);
        }
      } else {
        // Fallback offline mock for immediate demo
        const mockProduct: Product = {
          id: product ? product.id : 'prod-' + Date.now(),
          ...payload,
          created_at: product?.created_at || new Date().toISOString(),
        };

        const localProducts = JSON.parse(localStorage.getItem('gentina_offline_products') || '[]');
        if (product) {
          const updated = localProducts.map((p: Product) => (p.id === product.id ? mockProduct : p));
          localStorage.setItem('gentina_offline_products', JSON.stringify(updated));
        } else {
          localProducts.unshift(mockProduct);
          localStorage.setItem('gentina_offline_products', JSON.stringify(localProducts));
        }

        success(`Produk "${payload.name}" berhasil disimpan.`);
        onSuccess(mockProduct);
      }

      onClose();
    } catch (err: unknown) {
      console.error('Save product error:', err);
      error('Gagal menyimpan produk ke database. Periksa koneksi Supabase.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-100 text-teal-700">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {product ? 'Edit Data Produk' : 'Tambah Produk Baru'}
              </h3>
              <p className="text-xs text-slate-500">
                Katalog Gentina Jaya Textile
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

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="pt-4 flex-1 overflow-y-auto space-y-4">
          {/* Photo Upload & Preview */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Foto Produk (Upload ke Supabase Storage)
            </label>
            <div className="flex items-center gap-4">
              <div className="relative w-24 h-24 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-300 overflow-hidden flex items-center justify-center shrink-0">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="w-8 h-8 text-slate-400" />
                )}
              </div>
              <div className="flex-1 space-y-1.5">
                <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer border border-slate-200 transition">
                  <UploadCloud className="w-4 h-4 text-teal-600" />
                  <span>Pilih File Gambar</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                <p className="text-[11px] text-slate-400">
                  Format JPG, PNG, WEBP. Maks 5MB. Otomatis disimpan ke bucket <code className="font-mono text-teal-700">gentina-media</code>.
                </p>
              </div>
            </div>
          </div>

          {/* Product Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Bahan / Alat Konveksi <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Kain Katun Combed 30s Reaktif"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Category & Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kategori <span className="text-rose-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => {
                  const cat = e.target.value as ProductCategory;
                  setCategory(cat);
                  if (cat === 'Kain') setUnit('roll');
                  else setUnit('lusin');
                }}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
              >
                <option value="Kain">Kain</option>
                <option value="Alat Konveksi">Alat Konveksi</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Satuan Jual <span className="text-rose-500">*</span>
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
              >
                {PRODUCT_UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u} {category === 'Kain' && (u === 'roll' || u === 'meter') ? '(Standar Kain)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Price */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Harga Satuan (Rupiah) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">
                Rp
              </span>
              <input
                type="number"
                required
                min={0}
                step={500}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Contoh: 2450000"
                className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Stock Availability */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Status Ketersediaan Stok
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsReady(true)}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition ${
                  isReady
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-1 ring-emerald-300'
                    : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Ready Stock</span>
              </button>
              <button
                type="button"
                onClick={() => setIsReady(false)}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition ${
                  !isReady
                    ? 'bg-amber-50 text-amber-800 border-amber-300 ring-1 ring-amber-300'
                    : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Pre-Order (PO)</span>
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white font-bold text-xs shadow-md shadow-teal-600/30 transition active:scale-98 cursor-pointer"
            >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <span>{product ? 'Simpan Perubahan' : 'Tambah ke Katalog'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
