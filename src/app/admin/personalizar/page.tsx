'use client';

import { useEffect, useState } from 'react';
import { useToast } from '@/context/ToastContext';
import {
  Palette,
  Store,
  Sparkles,
  Type,
  Image as ImageIcon,
  Check,
  RotateCcw,
  ShoppingBag,
} from 'lucide-react';
import Link from 'next/link';

export type ThemeColor = 'emerald' | 'amber' | 'rose' | 'indigo' | 'blue';

export default function AdminPersonalizarPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    store_name: 'Kaibutsu Market',
    store_tagline: 'Tu almacén con pedidos por WhatsApp',
    hero_title: 'Pide en línea y confirma directo por WhatsApp',
    hero_subtitle: 'Elige tus productos, agrega al carrito y coordina la entrega directamente con nosotros.',
    theme_color: 'emerald' as ThemeColor,
    logo_url: '',
  });

  const colorPalettes: {
    id: ThemeColor;
    name: string;
    description: string;
    bgClass: string;
    heroGradient: string;
    borderClass: string;
    badgeClass: string;
  }[] = [
    {
      id: 'emerald',
      name: 'Verde Esmeralda',
      description: 'Fresco, natural, tradicional de almacén y verdulería.',
      bgClass: 'bg-emerald-600',
      heroGradient: 'from-emerald-700 via-emerald-600 to-teal-700',
      borderClass: 'border-emerald-500',
      badgeClass: 'bg-emerald-100 text-emerald-800',
    },
    {
      id: 'amber',
      name: 'Ámbar Cálido',
      description: 'Panadería, bollería y atmósfera de barrio acogedora.',
      bgClass: 'bg-amber-600',
      heroGradient: 'from-amber-700 via-amber-600 to-yellow-600',
      borderClass: 'border-amber-500',
      badgeClass: 'bg-amber-100 text-amber-800',
    },
    {
      id: 'rose',
      name: 'Rojo Carmesí',
      description: 'Carnicería, ofertas intensas y minimarket de paso.',
      bgClass: 'bg-rose-600',
      heroGradient: 'from-rose-700 via-rose-600 to-red-700',
      borderClass: 'border-rose-500',
      badgeClass: 'bg-rose-100 text-rose-800',
    },
    {
      id: 'blue',
      name: 'Azul Comercial',
      description: 'Confianza, botillería y abarrotes en general.',
      bgClass: 'bg-blue-600',
      heroGradient: 'from-blue-700 via-blue-600 to-cyan-700',
      borderClass: 'border-blue-500',
      badgeClass: 'bg-blue-100 text-blue-800',
    },
    {
      id: 'indigo',
      name: 'Índigo Moderno',
      description: 'Estilo boutique gourmet, minimarket premium y café.',
      bgClass: 'bg-indigo-600',
      heroGradient: 'from-indigo-800 via-indigo-600 to-violet-700',
      borderClass: 'border-indigo-500',
      badgeClass: 'bg-indigo-100 text-indigo-800',
    },
  ];

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.settings) {
        setFormData({
          store_name: data.settings.store_name || 'Kaibutsu Market',
          store_tagline: data.settings.store_tagline || 'Tu almacén con pedidos por WhatsApp',
          hero_title: data.settings.hero_title || 'Pide en línea y confirma directo por WhatsApp',
          hero_subtitle:
            data.settings.hero_subtitle ||
            'Elige tus productos, agrega al carrito y coordina la entrega directamente con nosotros.',
          theme_color: (data.settings.theme_color || 'emerald') as ThemeColor,
          logo_url: data.settings.logo_url || '',
        });
      }
    } catch (e) {
      console.error(e);
      showToast('Error al cargar la personalización', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        showToast('Personalización de la tienda guardada con éxito', 'success');
      } else {
        showToast('Error al guardar la personalización', 'error');
      }
    } catch (e) {
      showToast('Error de conexión', 'error');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const currentTheme =
    colorPalettes.find((c) => c.id === formData.theme_color) || colorPalettes[0];

  if (loading) {
    return <div className="py-16 text-center text-xs text-neutral-400">Cargando personalización...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-neutral-900">Personalización de Marca & Apariencia</h2>
          <p className="text-xs text-neutral-500">
            Define el nombre, lema, colores y mensajes de bienvenida de la tienda online de tus clientes.
          </p>
        </div>

        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold shadow-xs transition-all self-start sm:self-center"
        >
          <span>Ver Tienda en Vivo</span>
          <Sparkles className="w-3.5 h-3.5" />
        </Link>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* SECCIÓN 1: IDENTIDAD DE LA TIENDA */}
        <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
            <Store className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-neutral-900">Identidad del Negocio</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1.5">
                Nombre de la Tienda / Almacén *
              </label>
              <input
                type="text"
                required
                value={formData.store_name}
                onChange={(e) => setFormData({ ...formData, store_name: e.target.value })}
                placeholder="Ej. Kaibutsu Market, Minimarket Doña Elena..."
                className="w-full px-3.5 py-2.5 text-sm font-semibold rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
              <span className="text-[11px] text-neutral-400 mt-1 block">
                Se muestra en la barra superior (Navbar) y pie de página.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1.5">
                Lema o Bajada Comercial
              </label>
              <input
                type="text"
                value={formData.store_tagline}
                onChange={(e) => setFormData({ ...formData, store_tagline: e.target.value })}
                placeholder="Ej. Tu almacén de confianza con pedidos rápidos"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
              <span className="text-[11px] text-neutral-400 mt-1 block">
                Texto secundario que acompaña a la marca del negocio.
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-800 mb-1.5">
              URL del Logo o Ícono de Marca (Opcional)
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={formData.logo_url}
                onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                placeholder="https://ejemplo.com/logo.png"
                className="flex-1 px-3.5 py-2.5 text-sm rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
              {formData.logo_url && (
                <div className="w-10 h-10 rounded-xl border border-neutral-200 bg-neutral-50 overflow-hidden shrink-0 flex items-center justify-center">
                  <img
                    src={formData.logo_url}
                    alt="Logo preview"
                    className="w-full h-full object-contain"
                    onError={(e) => ((e.target as HTMLElement).style.display = 'none')}
                  />
                </div>
              )}
            </div>
            <span className="text-[11px] text-neutral-400 mt-1 block">
              Si se deja vacío, se mostrará el ícono amigable de tienda predeterminado.
            </span>
          </div>
        </div>

        {/* SECCIÓN 2: PALETA DE COLOR TEMÁTICA */}
        <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
            <Palette className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-neutral-900">Paleta de Color Temática</h3>
          </div>
          <p className="text-xs text-neutral-500">
            Selecciona el color que mejor combina con el rubro o diseño de la marca:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {colorPalettes.map((palette) => {
              const isSelected = formData.theme_color === palette.id;
              return (
                <button
                  key={palette.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, theme_color: palette.id })}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'border-neutral-200 bg-white hover:bg-neutral-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-4 h-4 rounded-full ${palette.bgClass} shadow-xs shrink-0`} />
                      <span className="text-xs font-bold text-neutral-900">{palette.name}</span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-emerald-600" />}
                  </div>
                  <p className="text-[11px] text-neutral-500 leading-snug">{palette.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* SECCIÓN 3: BANNER HERO DE BIENVENIDA */}
        <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
            <Type className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-neutral-900">Banner Principal de Portada (Hero)</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1.5">
                Título Principal del Banner *
              </label>
              <input
                type="text"
                required
                value={formData.hero_title}
                onChange={(e) => setFormData({ ...formData, hero_title: e.target.value })}
                placeholder="Ej. Pide en línea y confirma directo por WhatsApp"
                className="w-full px-3.5 py-2.5 text-sm font-semibold rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1.5">
                Subtítulo o Mensaje de Bienvenida *
              </label>
              <textarea
                rows={2}
                required
                value={formData.hero_subtitle}
                onChange={(e) => setFormData({ ...formData, hero_subtitle: e.target.value })}
                placeholder="Ej. Elige tus productos, agrega al carrito y coordina la entrega directamente con nosotros."
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>
          </div>

          {/* Previsualización en vivo del Banner */}
          <div className="pt-2">
            <span className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
              Vista previa en tiempo real del Banner:
            </span>
            <div
              className={`relative overflow-hidden rounded-3xl bg-linear-to-r ${currentTheme.heroGradient} text-white p-6 shadow-sm transition-all duration-300`}
            >
              <div className="relative z-10 max-w-xl space-y-2">
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-bold uppercase tracking-wider text-white">
                  {formData.store_name}
                </span>
                <h4 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                  {formData.hero_title || 'Título del Banner'}
                </h4>
                <p className="text-white/90 text-xs sm:text-sm font-medium leading-relaxed">
                  {formData.hero_subtitle || 'Subtítulo del banner promocional...'}
                </p>
              </div>
              <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-15 pointer-events-none">
                <ShoppingBag className="w-36 h-36 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Botones de Guardar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all disabled:opacity-60 cursor-pointer"
          >
            {saving ? 'Guardando Personalización...' : 'Guardar Todos los Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
}
