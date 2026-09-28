'use client';

import { useEffect, useState } from 'react';
import { useToast } from '@/context/ToastContext';
import { Sparkles, Check, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function AdminModulosPage() {
  const { showToast } = useToast();
  const [storeSettings, setStoreSettings] = useState({
    module_ofertas_relampago: false,
    module_combos_dia: false,
    module_vitrina_pan: false,
    module_pedidos_programados: false,
  });
  const [loading, setLoading] = useState(true);
  const [savingField, setSavingField] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.settings) {
        setStoreSettings({
          module_ofertas_relampago: Boolean(data.settings.module_ofertas_relampago),
          module_combos_dia: Boolean(data.settings.module_combos_dia),
          module_vitrina_pan: Boolean(data.settings.module_vitrina_pan),
          module_pedidos_programados: Boolean(data.settings.module_pedidos_programados),
        });
      }
    } catch (e) {
      console.error(e);
      showToast('Error al cargar módulos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleModule = async (moduleKey: keyof typeof storeSettings, moduleName: string) => {
    const nextValue = !storeSettings[moduleKey];
    setSavingField(moduleKey);

    // Optimistic update
    setStoreSettings((prev) => ({ ...prev, [moduleKey]: nextValue }));

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [moduleKey]: nextValue }),
      });

      if (res.ok) {
        showToast(
          `Módulo "${moduleName}" ${nextValue ? 'activado' : 'desactivado'} con éxito`,
          nextValue ? 'success' : 'info'
        );
      } else {
        // Revert
        setStoreSettings((prev) => ({ ...prev, [moduleKey]: !nextValue }));
        showToast('Error al actualizar el estado del módulo', 'error');
      }
    } catch (e) {
      // Revert
      setStoreSettings((prev) => ({ ...prev, [moduleKey]: !nextValue }));
      showToast('Error de conexión con el servidor', 'error');
    } finally {
      setSavingField(null);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const modulesList = [
    {
      key: 'module_ofertas_relampago' as const,
      icon: '⚡',
      title: 'Ofertas Relámpago con Cuenta Regresiva',
      subtitle: 'Liquidaciones de alta urgencia',
      description:
        'Muestra un producto destacado en liquidación con reloj regresivo interactivo y barra de stock en urgencia para acelerar la compra inmediata.',
      impact: 'Aumenta compras por impulso en un 25-35%',
      badge: 'Conversión Rápida',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    },
    {
      key: 'module_combos_dia' as const,
      icon: '⭐',
      title: 'Combos Sugeridos del Día (Once Completa)',
      subtitle: 'Packs y agrupaciones de productos',
      description:
        'Sugiere packs completos con descuento (Ej. Hallulla + Cecina + Queso + Té) con botón de 1 toque directo al carrito.',
      impact: 'Eleva el ticket promedio de compra por cliente',
      badge: 'Mayor Ticket',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    },
    {
      key: 'module_vitrina_pan' as const,
      icon: '🥖',
      title: 'Vitrina de Pan Caliente y Horneados',
      subtitle: 'Avisos en vivo para vecinos',
      description:
        'Avisa a los clientes las tandas de pan recién salido del horno en tiempo real con reserva directa de kilos antes de que se agote.',
      impact: 'Fidelización diaria y venta rápida por rotación',
      badge: 'Fidelización Vecinal',
      badgeColor: 'bg-orange-100 text-orange-800 border-orange-200',
    },
    {
      key: 'module_pedidos_programados' as const,
      icon: '📅',
      title: 'Pedidos Programados y Encargos Anticipados',
      subtitle: 'Reservas con fecha y hora',
      description:
        'Habilita en el checkout del carrito la opción de encargar con fecha y hora futura para tortas, empanadas de fin de semana o eventos.',
      impact: 'Organización logística y ventas anticipadas',
      badge: 'Planificación',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    },
  ];

  if (loading) {
    return <div className="py-16 text-center text-xs text-neutral-400">Cargando módulos de prueba...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Banner Introductorio */}
      <div className="bg-linear-to-r from-emerald-900 via-neutral-900 to-neutral-950 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-md">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-emerald-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Módulos Add-On</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Módulos Tácticos de Venta Activa
          </h2>
          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
            Activa o desactiva individualmente los módulos interactivos en la tienda de tus clientes. Puedes probar cómo reacciona tu público y qué impacto tienen en tus ventas antes de dejarlos fijos.
          </p>
        </div>

        <div className="absolute right-0 bottom-0 translate-x-8 translate-y-8 text-9xl opacity-10 select-none pointer-events-none">
          ⚡
        </div>
      </div>

      {/* Lista de Módulos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {modulesList.map((mod) => {
          const isEnabled = storeSettings[mod.key];
          const isSaving = savingField === mod.key;

          return (
            <div
              key={mod.key}
              className={`rounded-3xl border p-5 sm:p-6 transition-all flex flex-col justify-between ${
                isEnabled
                  ? 'bg-white border-emerald-300 shadow-sm ring-1 ring-emerald-500/20'
                  : 'bg-neutral-50/70 border-neutral-200'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl p-2 rounded-2xl bg-neutral-100 flex items-center justify-center">
                      {mod.icon}
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-neutral-900 leading-tight">
                        {mod.title}
                      </h3>
                      <span className="text-[11px] text-neutral-500">{mod.subtitle}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => handleToggleModule(mod.key, mod.title)}
                    className={`relative inline-flex h-6 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isEnabled ? 'bg-emerald-600' : 'bg-neutral-300'
                    } ${isSaving ? 'opacity-60 cursor-wait' : ''}`}
                    title={isEnabled ? 'Haz clic para desactivar' : 'Haz clic para activar'}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        isEnabled ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <p className="text-xs text-neutral-600 leading-relaxed mb-4">
                  {mod.description}
                </p>
              </div>

              <div className="pt-3 border-t border-neutral-100 flex items-center justify-between gap-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${mod.badgeColor}`}>
                  {mod.badge}
                </span>

                <div className="flex items-center gap-1.5 text-[11px] font-medium text-neutral-500">
                  {isEnabled ? (
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                      <Check className="w-3.5 h-3.5" /> Visible en Tienda
                    </span>
                  ) : (
                    <span>Inactivo</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Acceso directo a la tienda para comprobar resultados */}
      <div className="p-4 rounded-2xl bg-white border border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="text-xs text-neutral-600 text-center sm:text-left">
          <span className="font-bold text-neutral-900 block">¿Deseas verificar cómo se ven en vivo?</span>
          Los cambios se reflejan inmediatamente en la página principal para todos los visitantes.
        </div>
        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold transition-all shrink-0 cursor-pointer"
        >
          <span>Ver Tienda en Vivo</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
