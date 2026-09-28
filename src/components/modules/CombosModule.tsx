'use client';

import { useState } from 'react';
import { useCartStore } from '@/store/cartStore';
import { useToast } from '@/context/ToastContext';
import { Sparkles, ShoppingBag, Check, Plus } from 'lucide-react';
import { formatPrice } from '@/lib/whatsapp';

export default function CombosModule() {
  const { addItem } = useCartStore();
  const { showToast } = useToast();
  const [added, setAdded] = useState(false);

  const handleAddCombo = () => {
    const comboProduct = {
      id: 'combo-once-completa',
      name: 'Pack Once Completa (Hallulla + Queso + Jamón + Té)',
      description: 'Incluye: 1 Kg Hallulla recién horneada + 250g Queso Gauda + 200g Jamón Colonial + Caja Té Ceylán 20u.',
      price: 6890,
      stock: 20,
      is_available: true,
      category: 'Combos',
      image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=60',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const success = addItem(comboProduct, 1);
    if (success) {
      setAdded(true);
      showToast('¡Pack Once Completa añadido al carrito con descuento!', 'success');
      setTimeout(() => setAdded(false), 2000);
    } else {
      showToast('Stock temporalmente agotado', 'error');
    }
  };

  return (
    <section className="bg-white rounded-3xl border-2 border-emerald-400/50 p-5 sm:p-6 shadow-sm relative overflow-hidden">
      {/* Badge indicador de módulo de prueba */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-neutral-100 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-600 text-white">
            <Sparkles className="w-4 h-4 fill-white" />
          </div>
          <span className="text-xs sm:text-sm font-extrabold text-neutral-900">
            Combo Sugerido del Día: El Multiplicador de la Once
          </span>
        </div>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
          Módulo de Prueba • No incluido en Plan Base
        </span>
      </div>

      <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="flex-1 space-y-3 w-full">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md">
              Sugerencia Inteligente • Ahorro Vecino: $1.200
            </span>
            <h3 className="text-base sm:text-lg font-bold text-neutral-900 mt-1">
              Pack Once Completa Tradicional
            </h3>
            <p className="text-xs text-neutral-600 mt-0.5">
              Todo lo necesario para la mesa de la tarde en un solo pedido.
            </p>
          </div>

          {/* Desglose de ítems */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
            <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-100">
              <span className="text-xs font-bold text-neutral-900 block">1 Kg Hallulla</span>
              <span className="text-[10px] text-neutral-500">Recién horneada</span>
            </div>
            <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-100">
              <span className="text-xs font-bold text-neutral-900 block">250g Queso Gauda</span>
              <span className="text-[10px] text-neutral-500">Laminado fresco</span>
            </div>
            <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-100">
              <span className="text-xs font-bold text-neutral-900 block">200g Jamón Colonial</span>
              <span className="text-[10px] text-neutral-500">Sellado al vacío</span>
            </div>
            <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-100">
              <span className="text-xs font-bold text-neutral-900 block">Té Ceylán 20 u.</span>
              <span className="text-[10px] text-neutral-500">Club o Supremo</span>
            </div>
          </div>
        </div>

        {/* Pricing y Botón */}
        <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col items-center justify-between gap-3 w-full lg:w-auto p-4 rounded-2xl bg-neutral-50 border border-neutral-100">
          <div className="text-center sm:text-left lg:text-center">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
              Precio Separado: <span className="line-through">{formatPrice(8090)}</span>
            </span>
            <span className="text-2xl font-black text-emerald-700 tabular-nums block">
              {formatPrice(6890)}
            </span>
            <span className="text-[11px] font-bold text-emerald-800">
              Margen protegido para el local
            </span>
          </div>

          <button
            type="button"
            onClick={handleAddCombo}
            className={`w-full sm:w-auto px-5 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer ${
              added
                ? 'bg-emerald-800 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95'
            }`}
          >
            {added ? (
              <>
                <Check className="w-4 h-4" />
                <span>¡Combo Añadido!</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Añadir Combo al Carrito ({formatPrice(6890)})</span>
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
