'use client';

import { useEffect, useState } from 'react';
import { Product } from '@/lib/db';
import ProductCard from '@/components/ProductCard';
import { Search, ShoppingBag, Sparkles, Filter, Clock, Store } from 'lucide-react';

import FlashSaleModule from '@/components/modules/FlashSaleModule';
import CombosModule from '@/components/modules/CombosModule';
import FreshBreadModule from '@/components/modules/FreshBreadModule';
import StoreSignage, { SignageStyle } from '@/components/StoreSignage';

interface StoreSettings {
  is_open: boolean;
  schedule_text: string;
  announcement_text?: string;
  module_ofertas_relampago?: boolean;
  module_combos_dia?: boolean;
  module_vitrina_pan?: boolean;
  module_pedidos_programados?: boolean;
  signage_style?: SignageStyle | string;
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<StoreSettings>({
    is_open: true,
    schedule_text: 'Lunes a Sábado: 09:00 - 21:00 hrs',
    announcement_text: '',
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.products) {
        setProducts(data.products);
        const uniqueCats = Array.from(
          new Set(data.products.map((p: Product) => p.category || 'General'))
        ) as string[];
        setCategories(['Todos', ...uniqueCats]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.settings) {
        setSettings(data.settings);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchSettings();
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategory === 'Todos' || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 text-white p-6 sm:p-10 shadow-sm">
        <div className="relative z-10 max-w-2xl space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Pide en línea y confirma directo por WhatsApp
          </h1>
          <p className="text-emerald-50 text-sm sm:text-base font-medium">
            Elige tus productos, agrega al carrito y coordina la entrega directamente con nosotros.
          </p>
        </div>
        <div className="absolute right-0 bottom-0 translate-x-8 translate-y-8 opacity-10 pointer-events-none">
          <ShoppingBag className="w-72 h-72 text-white" />
        </div>
      </section>

      {/* Cartel de Horario de Atención y Estado (Atendiendo / Cerrado) */}
      <section className="bg-white rounded-3xl border border-neutral-200 p-4 sm:p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-neutral-100 text-neutral-700 shrink-0">
            <Clock className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Horario de Atención
              </span>
            </div>
            <p className="text-sm font-bold text-neutral-900 mt-0.5">
              {settings.schedule_text}
            </p>
            {settings.announcement_text && (
              <p className="text-xs text-neutral-600 mt-0.5 font-medium">
                {settings.announcement_text}
              </p>
            )}
          </div>
        </div>

        {/* Cartel Dinámico Atendiendo / Cerrado Seleccionable */}
        <div className="shrink-0 self-start md:self-center">
          <StoreSignage
            isOpen={settings.is_open}
            style={settings.signage_style || 'hanging'}
          />
        </div>
      </section>

      {/* MÓDULOS DE VENTA ACTIVA (ACTIVADOS DESDE PANEL ADMIN) */}
      {settings.module_ofertas_relampago && <FlashSaleModule />}
      {settings.module_combos_dia && <CombosModule />}
      {settings.module_vitrina_pan && <FreshBreadModule />}

      {/* Search and Filters Bar */}
      <section className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre o descripción..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-neutral-400"
          />
        </div>

        {/* Categories Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-neutral-900 text-white shadow-sm'
                  : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Products Grid */}
      <section>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-neutral-200 p-4 h-72 animate-pulse flex flex-col justify-between"
              >
                <div className="w-full aspect-square bg-neutral-100 rounded-xl" />
                <div className="space-y-2 mt-3">
                  <div className="h-4 bg-neutral-100 rounded w-3/4" />
                  <div className="h-3 bg-neutral-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-neutral-200">
            <ShoppingBag className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-neutral-800">
              No se encontraron productos
            </h3>
            <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
              Intenta buscar con otros términos o cambia la categoría seleccionada.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
