'use client';

import { useEffect, useState } from 'react';
import { useToast } from '@/context/ToastContext';
import { Clock, Phone, Palette } from 'lucide-react';
import Link from 'next/link';
import StoreSignage, { SignageStyle } from '@/components/StoreSignage';

export default function AdminHorarioPage() {
  const { showToast } = useToast();
  const [storeSettings, setStoreSettings] = useState({
    is_open: true,
    store_phone: '56912345678',
    schedule_text: '',
    announcement_text: '',
    module_ofertas_relampago: false,
    module_combos_dia: false,
    module_vitrina_pan: false,
    module_pedidos_programados: false,
    signage_style: 'hanging' as SignageStyle,
  });
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.settings) {
        setStoreSettings({
          is_open: data.settings.is_open,
          store_phone: data.settings.store_phone || '56912345678',
          schedule_text: data.settings.schedule_text || '',
          announcement_text: data.settings.announcement_text || '',
          module_ofertas_relampago: Boolean(data.settings.module_ofertas_relampago),
          module_combos_dia: Boolean(data.settings.module_combos_dia),
          module_vitrina_pan: Boolean(data.settings.module_vitrina_pan),
          module_pedidos_programados: Boolean(data.settings.module_pedidos_programados),
          signage_style: (data.settings.signage_style || 'hanging') as SignageStyle,
        });
      }
    } catch (e) {
      console.error(e);
      showToast('Error al cargar la configuración', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(storeSettings),
      });
      if (res.ok) {
        showToast('Horario y estado de atención actualizados', 'success');
      } else {
        showToast('Error al actualizar horarios', 'error');
      }
    } catch (e) {
      showToast('Error de conexión', 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  if (loading) {
    return <div className="py-16 text-center text-xs text-neutral-400">Cargando horario y configuración...</div>;
  }

  return (
    <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 shadow-sm max-w-2xl">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-neutral-900">Horario de Atención y Estado del Local</h2>
        <p className="text-xs text-neutral-500 mt-1">
          Controla el cartel visible para los clientes con el estado de apertura y los horarios comerciales.
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-5">
        {/* Switch de Estado Abierto / Cerrado */}
        <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-center justify-between gap-4">
          <div>
            <span className="block text-sm font-bold text-neutral-900">Estado de Atención</span>
            <span className="text-xs text-neutral-500 font-medium">
              {storeSettings.is_open
                ? 'El local se muestra como "Atendiendo Ahora" con luz verde intermitente'
                : 'El local se muestra como "Cerrado por ahora"'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setStoreSettings({ ...storeSettings, is_open: !storeSettings.is_open })}
            className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              storeSettings.is_open ? 'bg-emerald-600' : 'bg-neutral-300'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                storeSettings.is_open ? 'translate-x-7' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div>
          <label className="block text-xs font-bold text-neutral-800 mb-1.5">
            Número de WhatsApp de la Tienda (Para recibir pedidos) *
          </label>
          <div className="relative">
            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input
              type="tel"
              required
              value={storeSettings.store_phone}
              onChange={(e) => setStoreSettings({ ...storeSettings, store_phone: e.target.value })}
              placeholder="Ej. +56912345678 o 56912345678"
              className="w-full pl-10 pr-3.5 py-2.5 text-sm font-medium rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>
          <span className="text-xs text-neutral-500 mt-1 block">
            Los clientes enviarán los pedidos de WhatsApp a este número telefónico.
          </span>
        </div>

        <div>
          <label className="block text-xs font-bold text-neutral-800 mb-1.5">
            Texto del Horario de Atención *
          </label>
          <input
            type="text"
            required
            value={storeSettings.schedule_text}
            onChange={(e) => setStoreSettings({ ...storeSettings, schedule_text: e.target.value })}
            placeholder="Ej. Lunes a Sábado: 09:00 - 21:00 hrs | Domingo: 10:00 - 15:00 hrs"
            className="w-full px-3.5 py-2.5 text-sm font-medium rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
          />
          <span className="text-xs text-neutral-500 mt-1 block">
            Este texto se muestra en el banner superior de la página principal.
          </span>
        </div>

        <div>
          <label className="block text-xs font-bold text-neutral-800 mb-1.5">
            Mensaje o Anuncio Especial (Opcional)
          </label>
          <input
            type="text"
            value={storeSettings.announcement_text}
            onChange={(e) => setStoreSettings({ ...storeSettings, announcement_text: e.target.value })}
            placeholder="Ej. ¡Estamos atendiendo con despacho a domicilio rápido!"
            className="w-full px-3.5 py-2.5 text-sm font-medium rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
          />
        </div>

        {/* Selector de Estilo de Letrero Atendiendo */}
        <div className="pt-2 space-y-3">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-emerald-600" />
            <label className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
              Estilo del Letrero &quot;Atendiendo Ahora&quot;
            </label>
          </div>
          <p className="text-xs text-neutral-500">
            Elige el diseño visual que mejor represente la personalidad y fachada de tu minimarket:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                id: 'hanging',
                title: 'Cartel Fachada',
                desc: 'Colgante vintage tradicional con cadenas y remaches',
              },
              {
                id: 'neon',
                title: 'Letrero Neón',
                desc: 'Tubos brillantes luminosos estilo Open Sign',
              },
              {
                id: 'canopy',
                title: 'Toldo & Vitrina',
                desc: 'Toldo a rayas con persiana de almacén',
              },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() =>
                  setStoreSettings({ ...storeSettings, signage_style: opt.id as SignageStyle })
                }
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  storeSettings.signage_style === opt.id
                    ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'border-neutral-200 bg-white hover:bg-neutral-50'
                }`}
              >
                <span className="block text-xs font-bold text-neutral-900">{opt.title}</span>
                <span className="block text-[11px] text-neutral-500 mt-1 leading-snug">{opt.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Vista Previa del Cartel */}
        <div className="pt-2">
          <span className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
            Vista previa en vivo del letrero elegido:
          </span>
          <div className="p-5 rounded-2xl border border-neutral-200 bg-neutral-50/50 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-white shadow-2xs text-emerald-600">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-neutral-400 uppercase block">Horario en Cartel</span>
                <span className="text-sm font-bold text-neutral-900">
                  {storeSettings.schedule_text || 'Sin horario definido'}
                </span>
                {storeSettings.announcement_text && (
                  <span className="text-xs text-neutral-600 block mt-0.5 font-medium">
                    {storeSettings.announcement_text}
                  </span>
                )}
              </div>
            </div>

            <div className="shrink-0">
              <StoreSignage
                isOpen={storeSettings.is_open}
                style={storeSettings.signage_style}
              />
            </div>
          </div>
        </div>

        {/* Acceso a Módulos de Prueba */}
        <div className="pt-6 border-t border-neutral-200">
          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-neutral-900">Módulos Tácticos de Venta</span>
                <span className="bg-amber-50 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200">
                  Add-Ons
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">
                Ofertas Relámpago, Combos del Día, Vitrina de Pan y Pedidos Programados.
              </p>
            </div>
            <Link
              href="/admin/modulos"
              className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-white hover:bg-neutral-100 text-neutral-800 border border-neutral-200 text-xs font-semibold shadow-2xs transition-colors shrink-0"
            >
              Configurar Módulos &rarr;
            </Link>
          </div>
        </div>

        <div className="pt-3 flex justify-end">
          <button
            type="submit"
            disabled={savingSettings}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all disabled:opacity-60 cursor-pointer"
          >
            {savingSettings ? 'Guardando...' : 'Guardar Horario & Estado'}
          </button>
        </div>
      </form>
    </div>
  );
}
