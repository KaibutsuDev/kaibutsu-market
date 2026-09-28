'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '@/store/cartStore';
import { useToast } from '@/context/ToastContext';
import { Timer, Zap, ShoppingCart, Check } from 'lucide-react';
import { formatPrice } from '@/lib/whatsapp';

export default function FlashSaleModule() {
  const { addItem } = useCartStore();
  const { showToast } = useToast();
  const [seconds, setSeconds] = useState(42 * 60 + 19);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (totalSec: number) => {
    const hrs = String(Math.floor(totalSec / 3600)).padStart(2, '0');
    const mins = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
    const secs = String(totalSec % 60).padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  };

  const handleAddToCart = () => {
    const promoProduct = {
      id: 'promo-aceite-900',
      name: 'Aceite Maravilla Tradicional 900ml (Oferta Relámpago)',
      description: 'Aceite 100% puro vegetal en botella de 900ml. Promoción por tiempo limitado.',
      price: 1790,
      stock: 6,
      is_available: true,
      category: 'Abarrotes',
      image_url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop&q=60',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const success = addItem(promoProduct, 1);
    if (success) {
      setAdded(true);
      showToast('¡Oferta relámpago añadida al carrito!', 'success');
      setTimeout(() => setAdded(false), 2000);
    } else {
      showToast('No hay más stock disponible de esta oferta', 'error');
    }
  };

  return (
    <section className="bg-gradient-to-br from-amber-500/10 via-white to-emerald-500/10 rounded-3xl border-2 border-amber-400/50 p-5 sm:p-6 shadow-sm relative overflow-hidden">
      {/* Badge indicador de módulo de prueba */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-amber-200/60 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500 text-white">
            <Zap className="w-4 h-4 fill-white" />
          </div>
          <span className="text-xs sm:text-sm font-extrabold text-neutral-900">
            Oferta Relámpago con Cuenta Regresiva
          </span>
        </div>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
          Módulo de Prueba • No incluido en Plan Base
        </span>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Info del producto */}
        <div className="flex-1 space-y-2 text-left w-full">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md">
            Abarrotes • Liquida Hoy
          </span>
          <h3 className="text-base sm:text-lg font-bold text-neutral-900">
            Aceite Maravilla Tradicional 900ml
          </h3>
          <p className="text-xs text-neutral-600">
            Aprovecha antes de que se acabe el tiempo o las unidades en bodega. Despacho directo al pasaje.
          </p>

          <div className="flex items-baseline gap-2.5 pt-1">
            <span className="text-2xl font-black text-emerald-700 tabular-nums">
              {formatPrice(1790)}
            </span>
            <span className="text-sm text-neutral-400 line-through tabular-nums">
              {formatPrice(2290)}
            </span>
            <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-red-100 text-red-700">
              -22% OFF (Ahorras $500)
            </span>
          </div>

          {/* Barra de Stock */}
          <div className="pt-2 max-w-sm">
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-neutral-500 font-medium">Stock disponible:</span>
              <span className="text-red-600 font-bold">¡Quedan solo 6 unidades!</span>
            </div>
            <div className="w-full h-2 rounded-full bg-neutral-200 overflow-hidden">
              <div className="h-full bg-emerald-600 rounded-full transition-all duration-500" style={{ width: '75%' }} />
            </div>
          </div>
        </div>

        {/* Reloj y Botón de acción */}
        <div className="w-full md:w-auto shrink-0 flex flex-col items-center sm:items-end gap-3">
          <div className="bg-white/95 border border-neutral-200 shadow-xs px-4 py-2.5 rounded-2xl flex items-center gap-3">
            <div className="text-left">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                Termina en
              </span>
              <span className="text-lg font-black text-emerald-700 tabular-nums font-mono">
                {formatTimer(seconds)}
              </span>
            </div>
            <Timer className="w-6 h-6 text-emerald-600 animate-pulse" />
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            className={`w-full sm:w-auto px-5 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer ${
              added
                ? 'bg-emerald-800 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95'
            }`}
          >
            {added ? (
              <>
                <Check className="w-4 h-4" />
                <span>¡Agregado al Carrito!</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                <span>Añadir Oferta al Carrito ({formatPrice(1790)})</span>
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
