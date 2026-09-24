'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Credenciales inválidas');
      }

      await refreshUser();

      // Redirigir según el rol
      if (data.user?.role === 'admin' || data.user?.role === 'superadmin') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-8 sm:my-12 bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200 shadow-md">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Iniciar Sesión</h1>
        <p className="text-sm text-neutral-600 mt-1 font-medium">
          Accede para gestionar tus compras o acceder al panel del vendedor.
        </p>
      </div>

      {error && (
        <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-neutral-800 mb-1.5">
            Correo Electrónico
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@minimarket.cl o tu correo"
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-neutral-300 bg-white text-neutral-900 text-sm font-medium placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-neutral-800 mb-1.5">
            Contraseña
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-neutral-300 bg-white text-neutral-900 text-sm font-medium placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
        >
          <span>{loading ? 'Iniciando sesión...' : 'Entrar a mi cuenta'}</span>
          {!loading && <ArrowRight className="w-4 h-4" />}
        </button>
      </form>

      <div className="mt-6 pt-5 border-t border-neutral-200 flex flex-col gap-3 text-center text-sm text-neutral-600">
        <p>
          ¿No tienes cuenta?{' '}
          <Link href="/register" className="text-emerald-700 font-bold hover:underline">
            Regístrate como cliente
          </Link>
        </p>
        <div className="p-3.5 bg-neutral-100 rounded-xl text-left border border-neutral-200">
          <p className="font-bold text-neutral-800 text-xs">Acceso Vendedor Demo:</p>
          <p className="text-xs text-neutral-700 font-mono mt-0.5 font-semibold">admin@minimarket.cl / admin1234</p>
        </div>
      </div>
    </div>
  );
}
