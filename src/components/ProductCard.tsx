'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { 
  ShoppingBag, 
  CheckCircle2, 
  Clock, 
  Layers, 
  Wrench, 
  Plus, 
  Minus,
  Sparkles
} from 'lucide-react';
import { Product } from '@/types/database';
import { formatRupiah } from '@/lib/utils';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [imgError, setImgError] = useState(false);

  const handleIncrement = () => setQuantity((q) => q + 1);
  const handleDecrement = () => setQuantity((q) => (q > 1 ? q - 1 : 1));

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setQuantity(1); // reset after adding
  };

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 hover:border-teal-300 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden">
      {/* Product Image & Badges */}
      <div className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden">
        {product.image_url && !imgError ? (
          <img
            src={product.image_url}
            alt={product.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-teal-50 to-slate-100 text-teal-700">
            {product.category === 'Kain' ? (
              <Layers className="w-12 h-12 text-teal-400 stroke-1" />
            ) : (
              <Wrench className="w-12 h-12 text-teal-400 stroke-1" />
            )}
            <span className="text-xs font-medium text-teal-800 mt-2">
              Gentina Jaya Textile
            </span>
          </div>
        )}

        {/* Category Badge (Top Left) */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-xs backdrop-blur-md ${
              product.category === 'Kain'
                ? 'bg-teal-900/80 text-white'
                : 'bg-indigo-900/80 text-white'
            }`}
          >
            {product.category === 'Kain' ? (
              <Layers className="w-3 h-3 text-teal-300" />
            ) : (
              <Wrench className="w-3 h-3 text-indigo-300" />
            )}
            {product.category}
          </span>
        </div>

        {/* Stock Status Badge (Top Right) */}
        <div className="absolute top-3 right-3">
          {product.is_ready ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-600/90 text-white backdrop-blur-md shadow-xs">
              <CheckCircle2 className="w-3 h-3" />
              Ready Stock
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-amber-500/90 text-white backdrop-blur-md shadow-xs">
              <Clock className="w-3 h-3" />
              Pre-Order (PO)
            </span>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Unit pill */}
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide bg-slate-100 px-2 py-0.5 rounded-md">
              Satuan: {product.unit}
            </span>
            {product.unit === 'roll' && (
              <span className="text-[10px] text-teal-700 font-medium flex items-center gap-0.5">
                <Sparkles className="w-3 h-3" /> Roll Grosir
              </span>
            )}
          </div>

          {/* Product Name */}
          <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-teal-700 transition line-clamp-2 min-h-11">
            {product.name}
          </h3>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 space-y-3">
          {/* Price display */}
          <div>
            <span className="text-xs text-slate-500 block">Harga Satuan</span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-black text-teal-700">
                {formatRupiah(product.price)}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                /{product.unit}
              </span>
            </div>
          </div>

          {/* Quantity Controls & Add To Cart Button */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-0.5">
                <button
                  type="button"
                  onClick={handleDecrement}
                  className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition"
                  aria-label="Kurangi jumlah"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-9 text-center text-xs font-bold text-slate-800">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={handleIncrement}
                  className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition"
                  aria-label="Tambah jumlah"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition shadow-sm shadow-teal-600/30 active:scale-98"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>+ Keranjang</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
