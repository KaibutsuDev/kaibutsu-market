import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Kaibutsu Market - Tu almacén con pedidos por WhatsApp',
  description: 'Catálogo online, carrito de compras sin pasarela de pago y coordinación directa por WhatsApp.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.className} min-h-screen bg-neutral-50 text-neutral-900 flex flex-col`}>
        <AuthProvider>
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </main>
          <footer className="bg-white border-t border-neutral-200 py-6 text-center text-xs text-neutral-500">
            <div className="max-w-7xl mx-auto px-4">
              <p className="font-medium text-neutral-700">Kaibutsu Market &copy; 2026</p>
              <p className="mt-1">Pedidos rápidos sin complicaciones • Envío a Domicilio o Retiro en Local</p>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
