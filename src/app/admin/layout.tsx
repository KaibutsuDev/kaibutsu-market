'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Layers, Clock, AlertTriangle, Sparkles } from 'lucide-react';

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

  const navLinks = [
    {
      href: '/admin/pedidos',
      label: 'Pedidos Recibidos',
      icon: ShoppingBag,
      exactMatch: false,
    },
    {
      href: '/admin/inventario',
      label: 'Inventario / Stock',
      icon: Layers,
      exactMatch: false,
    },
    {
      href: '/admin/horario',
      label: 'Horarios & Estado',
      icon: Clock,
      exactMatch: false,
    },
    {
      href: '/admin/modulos',
      label: 'Módulos de Prueba',
      icon: Sparkles,
      exactMatch: false,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Sub-navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-neutral-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Panel del Vendedor</h1>
          <p className="text-xs text-neutral-500">
            Control de inventario, stock en tiempo real y atención directa a clientes por WhatsApp.
          </p>
        </div>

        <nav className="flex items-center gap-2 bg-neutral-100 p-1.5 rounded-2xl overflow-x-auto scrollbar-none">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-white text-neutral-900 shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-neutral-400'}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Vista de la página actual */}
      {children}
    </div>
  );
}
