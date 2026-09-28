'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShoppingBag,
  Layers,
  Clock,
  AlertTriangle,
  Sparkles,
  Palette,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading: authLoading } = useAuth();
  const pathname = usePathname();

  if (authLoading) {
    return (
      <div className="py-20 text-center text-sm text-neutral-400">
        Verificando credenciales...
      </div>
    );
  }

  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
    return (
      <div className="max-w-md mx-auto my-16 text-center bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-neutral-900">Acceso Restringido</h2>
        <p className="text-xs text-neutral-500 mt-1 mb-6">
          Esta sección es exclusiva para el vendedor o la familia administradora de la tienda.
        </p>
        <Link
          href="/login"
          className="inline-flex px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-xs shadow-sm hover:bg-emerald-700"
        >
          Iniciar sesión como Vendedor
        </Link>
      </div>
    );
  }

  const navGroups = [
    {
      title: 'Gestión y Operaciones',
      badge: 'Día a día',
      items: [
        {
          href: '/admin/pedidos',
          label: 'Pedidos Recibidos',
          desc: 'Gestión y WhatsApp',
          icon: ShoppingBag,
        },
        {
          href: '/admin/inventario',
          label: 'Inventario / Stock',
          desc: 'Precios y catálogo',
          icon: Layers,
        },
        {
          href: '/admin/horario',
          label: 'Horarios & Estado',
          desc: 'Turnos y cartel',
          icon: Clock,
        },
      ],
    },
    {
      title: 'Configuración de Tienda',
      badge: 'Personalización',
      items: [
        {
          href: '/admin/modulos',
          label: 'Módulos de Venta',
          desc: 'Ofertas, combos y vitrina',
          icon: Sparkles,
        },
        {
          href: '/admin/personalizar',
          label: 'Personalizar Tienda',
          desc: 'Colores, textos y banner',
          icon: Palette,
        },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header Independiente del Panel */}
      <header className="bg-white p-5 sm:p-6 rounded-3xl border border-neutral-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
              Panel del Vendedor
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              {user.role === 'superadmin' ? 'Superadmin' : 'Vendedor'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 max-w-2xl">
            Control de inventario, stock en tiempo real y atención directa a clientes por WhatsApp.
          </p>
        </div>

        {/* Acceso Rápido a Tienda Pública */}
        <div className="flex items-center gap-2 self-start md:self-center shrink-0">
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold transition-all shadow-2xs"
          >
            <span>Ver Tienda</span>
            <ExternalLink className="w-3.5 h-3.5 text-neutral-500" />
          </Link>
        </div>
      </header>

      {/* 2. Menús Divididos por Secciones con Espacio Completo */}
      <nav aria-label="Menú del Administrador" className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {navGroups.map((group, groupIdx) => {
          const colSpan = groupIdx === 0 ? 'lg:col-span-7' : 'lg:col-span-5';

          return (
            <div
              key={group.title}
              className={`${colSpan} bg-white p-3.5 sm:p-4 rounded-3xl border border-neutral-200 shadow-sm flex flex-col justify-between`}
            >
              <div className="flex items-center justify-between mb-2.5 px-1">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-400">
                  {group.title}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-500">
                  {group.badge}
                </span>
              </div>

              <div
                className={`grid gap-2 ${
                  groupIdx === 0
                    ? 'grid-cols-1 sm:grid-cols-3'
                    : 'grid-cols-1 sm:grid-cols-2'
                }`}
              >
                {group.items.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname.startsWith(link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex flex-col p-3 rounded-2xl border transition-all text-left group ${
                        isActive
                          ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20 shadow-xs'
                          : 'border-neutral-200 hover:border-neutral-300 bg-neutral-50/40 hover:bg-neutral-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`p-1.5 rounded-xl transition-colors ${
                            isActive
                              ? 'bg-emerald-600 text-white'
                              : 'bg-white border border-neutral-200 text-neutral-500 group-hover:text-emerald-600'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <span
                          className={`text-xs font-bold ${
                            isActive ? 'text-emerald-950' : 'text-neutral-800'
                          }`}
                        >
                          {link.label}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] mt-1.5 line-clamp-1 ${
                          isActive ? 'text-emerald-700 font-medium' : 'text-neutral-500'
                        }`}
                      >
                        {link.desc}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* 3. Vista de la página actual */}
      <main>{children}</main>
    </div>
  );
}
