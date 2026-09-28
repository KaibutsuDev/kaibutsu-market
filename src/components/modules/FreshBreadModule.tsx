'use client';

import { useState } from 'react';
import { useCartStore } from '@/store/cartStore';
import { useToast } from '@/context/ToastContext';
import { Flame, Bookmark, Check } from 'lucide-react';
import { formatPrice } from '@/lib/whatsapp';

export default function FreshBreadModule() {
  const { addItem } = useCartStore();
  const { showToast } = useToast();
  const [reserved, setReserved] = useState(false);

  const handleReserveBread = () => {
    const breadProduct = {
      id: 'pan-caliente-tanda',
      name: 'Pan Caliente Recién Horneado (1 Kg Surtido)',
      description: 'Marraqueta y hallulla crujiente saliendo directo de la bandeja del horno.',
      price: 2190,
      stock: 15,
      is_available: true,
      category: 'Panadería',
      image_url: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=500&auto=format&fit=crop&q=60',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const success = addItem(breadProduct, 1);
    if (success) {
      setReserved(true);
      showToast('¡1 Kg de Pan Caliente reservado y agregado al carrito!', 'success');
      setTimeout(() => setReserved(false), 2000);
    } else {
      showToast('No quedan más kilos en esta tanda', 'error');
    }
  };

  return (
    <section className="bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-emerald-500/10 rounded-3xl border-2 border-orange-300 p-5 sm:p-6 shadow-sm relative overflow-hidden">
      {/* Badge indicador de módulo de prueba */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-orange-200/60 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-orange-500 text-white">
            <Flame className="w-4 h-4 fill-white" />
          </div>
          <span className="text-xs sm:text-sm font-extrabold text-neutral-900">
            Vitrina de Recién Salidos del Horno y Llegados de la Vega
          </span>
        </div>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
          Módulo de Prueba • No incluido en Plan Base
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
        <div className="space-y-1.5 text-left w-full sm:w-auto">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-800 bg-orange-100 px-2.5 py-0.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-orange-600 animate-pulse"></span>
            Segunda Tanda de la Tarde (18:45 hrs)
          </div>
          <h3 className="text-base sm:text-lg font-bold text-neutral-900">
            Marraqueta &amp; Hallulla Calentita
          </h3>
          <p className="text-xs text-neutral-600">
            Saliendo doradita de la bandeja. Reserva tu kilo antes de que se acabe la tanda.
          </p>
          <div className="flex items-center gap-3 text-xs text-neutral-700 font-semibold pt-1">
            <span className="text-base font-extrabold text-neutral-900 tabular-nums">
              {formatPrice(2190)} / Kg
            </span>
            <span className="text-neutral-400">•</span>
            <span className="text-emerald-700 font-bold">15 Kg disponibles en tanda</span>
          </div>
        </div>

        <div className="flex flex-col items-center sm:items-end gap-2 w-full sm:w-auto shrink-0">
          <div className="flex items-center gap-1.5 text-[11px] text-neutral-500">
            <div className="flex -space-x-1.5 overflow-hidden">
              <span className="inline-block h-5 w-5 rounded-full ring-1 ring-white bg-neutral-800 text-white text-[9px] font-bold text-center leading-5">M</span>
              <span className="inline-block h-5 w-5 rounded-full ring-1 ring-white bg-emerald-700 text-white text-[9px] font-bold text-center leading-5">R</span>
              <span className="inline-block h-5 w-5 rounded-full ring-1 ring-white bg-amber-700 text-white text-[9px] font-bold text-center leading-5">C</span>
            </div>
            <span>38 vecinos ya reservaron hoy</span>
          </div>

          <button
            type="button"
            onClick={handleReserveBread}
            className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer ${
              reserved
                ? 'bg-emerald-800 text-white'
                : 'bg-orange-600 hover:bg-orange-700 text-white active:scale-95'
            }`}
          >
            {reserved ? (
              <>
                <Check className="w-4 h-4" />
                <span>¡Kilo Reservado!</span>
              </>
            ) : (
              <>
                <Bookmark className="w-4 h-4" />
                <span>Reservar 1 Kg Caliente ({formatPrice(2190)})</span>
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
