'use client';

import { Product } from '@/lib/db';
import { formatPrice } from '@/lib/whatsapp';
import { useCartStore } from '@/store/cartStore';
import { useToast } from '@/context/ToastContext';
import { Plus, Check, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

export default function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem);
  const cartItems = useCartStore((state) => state.items);
  const { showToast } = useToast();
  const [addedAnimation, setAddedAnimation] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const cartItem = cartItems.find((item) => item.product.id === product.id);
  const currentQuantityInCart = cartItem ? cartItem.quantity : 0;
  const isOutOfStock = !product.is_available || product.stock <= 0;
  const reachedMaxStock = currentQuantityInCart >= product.stock;

  const handleAddToCart = () => {
    if (isOutOfStock) {
      showToast(`"${product.name}" está agotado`, 'error');
      return;
    }
    if (reachedMaxStock) {
      showToast(`Alcanzaste el stock disponible de "${product.name}"`, 'error');
      return;
    }

    const success = addItem(product, 1);
    if (success) {
      setAddedAnimation(true);
      setErrorMsg(null);
      showToast(`+1 ${product.name} agregado al carrito`, 'success');
      setTimeout(() => setAddedAnimation(false), 1200);
    } else {
      setErrorMsg('Límite de stock alcanzado');
      showToast(`Límite de stock alcanzado para ${product.name}`, 'error');
      setTimeout(() => setErrorMsg(null), 2500);
    }
  };

  return (
    <div className="group bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
      {/* Product Image & Badges */}
      <div className="relative aspect-square w-full bg-neutral-100 overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
              isOutOfStock ? 'grayscale opacity-60' : ''
            }`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-300">
            Sin foto
          </div>
        )}

        {/* Stock / Availability Status Badge */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
          {isOutOfStock ? (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-500 text-white shadow-sm">
              Agotado
            </span>
          ) : product.stock <= 5 ? (
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500 text-white shadow-sm">
              ¡Últimas {product.stock} un.!
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-600/90 text-white backdrop-blur-xs">
              Stock: {product.stock}
            </span>
          )}
        </div>

        {/* Category Badge */}
        {product.category && (
          <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-neutral-900/60 text-white backdrop-blur-xs">
            {product.category}
          </span>
        )}
      </div>

      {/* Product Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-semibold text-neutral-900 line-clamp-1 group-hover:text-emerald-700 transition-colors">
            {product.name}
          </h3>
          <p className="text-xs text-neutral-500 mt-1 line-clamp-2 min-h-[32px]">
            {product.description || 'Producto disponible para compra inmediata'}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between">
          <div>
            <span className="text-xs text-neutral-400 block font-medium">Precio</span>
            <span className="text-lg font-bold text-neutral-900">
              {formatPrice(product.price)}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || reachedMaxStock}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              isOutOfStock
                ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                : reachedMaxStock
                ? 'bg-amber-100 text-amber-800 cursor-not-allowed'
                : addedAnimation
                ? 'bg-emerald-600 text-white scale-95'
                : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm hover:shadow'
            }`}
          >
            {addedAnimation ? (
              <>
                <Check className="w-4 h-4" />
                <span>¡Listo!</span>
              </>
            ) : reachedMaxStock ? (
              <span>Límite ({currentQuantityInCart})</span>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>{currentQuantityInCart > 0 ? `+1 (${currentQuantityInCart})` : 'Añadir'}</span>
              </>
            )}
          </button>
        </div>

        {errorMsg && (
          <p className="mt-2 text-xs text-red-500 font-medium flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            {errorMsg}
          </p>
        )}
      </div>
    </div>
  );
}
