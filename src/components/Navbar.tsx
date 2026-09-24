'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useCartStore } from '@/store/cartStore';
import { ShoppingCart, Store, User as UserIcon, LogOut, PackageCheck, Shield } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const totalItems = useCartStore((state) => state.getTotalItems());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <span className="font-bold text-lg text-neutral-900 tracking-tight leading-none block">
              Kaibutsu Market
            </span>
            <span className="text-xs text-neutral-500 font-medium">Compras Rápidas & WhatsApp</span>
          </div>
        </Link>

        {/* Navigation & Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Admin link if user is seller/admin */}
          {user && (user.role === 'admin' || user.role === 'superadmin') && (
            <Link
              href="/admin"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 text-sm font-semibold border border-amber-200 hover:bg-amber-100 transition-colors"
            >
              <Shield className="w-4 h-4" />
              <span>Panel Vendedor</span>
            </Link>
          )}

          {/* Cart Icon Button */}
          <Link
            href="/cart"
            className="relative flex items-center gap-2 px-3.5 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-medium transition-all"
          >
            <ShoppingCart className="w-5 h-5 text-neutral-700" />
            <span className="hidden sm:inline text-sm">Carrito</span>
            {mounted && totalItems > 0 && (
              <span className="inline-flex items-center justify-center bg-emerald-600 text-white text-xs font-bold rounded-full h-5 min-w-5 px-1.5 animate-pulse">
                {totalItems}
              </span>
            )}
          </Link>

          {/* User profile dropdown / auth buttons */}
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/orders"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-50 hover:bg-neutral-100 text-neutral-700 text-sm font-medium border border-neutral-200 transition-colors"
                title="Mis Pedidos"
              >
                <PackageCheck className="w-4 h-4 text-emerald-600" />
                <span className="hidden md:inline">Mis Pedidos</span>
              </Link>

              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-semibold text-neutral-900 truncate max-w-[120px]">
                  {user.full_name}
                </span>
                <span className="text-[10px] text-neutral-500 uppercase tracking-wider">
                  {user.role === 'admin' ? 'Vendedor' : 'Cliente'}
                </span>
              </div>

              <button
                onClick={() => logout()}
                className="p-2 rounded-xl text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Cerrar Sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3.5 py-2 rounded-xl text-sm font-semibold text-neutral-700 hover:text-neutral-900 transition-colors"
              >
                Ingresar
              </Link>
              <Link
                href="/register"
                className="px-3.5 py-2 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors"
              >
                Crear Cuenta
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
