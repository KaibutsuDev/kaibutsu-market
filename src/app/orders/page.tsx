'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Order } from '@/lib/db';
import { formatPrice, generateCustomerOrderWhatsAppLink } from '@/lib/whatsapp';
import { Package, Clock, CheckCircle2, XCircle, Store, MapPin, MessageCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function CustomerOrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.orders) {
        setOrders(data.orders);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      fetchOrders();
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [authLoading, user]);

  if (authLoading || loading) {
    return (
      <div className="py-20 text-center text-sm text-neutral-400">
        Cargando tus pedidos...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-16 text-center bg-white p-8 rounded-3xl border border-neutral-200">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-neutral-900">Inicia sesión</h2>
        <p className="text-xs text-neutral-500 mt-1 mb-6">
          Debes estar autenticado para revisar tu historial de compras.
        </p>
        <Link
          href="/login"
          className="inline-flex px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-xs shadow-sm hover:bg-emerald-700"
        >
          Iniciar Sesión
        </Link>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            <span>Pendiente</span>
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Package className="w-3.5 h-3.5" />
            <span>Confirmado</span>
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Entregado</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
            <XCircle className="w-3.5 h-3.5" />
            <span>Cancelado</span>
          </span>
        );
      default:
        return null;
    }
  };

  const storePhone = process.env.NEXT_PUBLIC_STORE_PHONE || '56912345678';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Mis Pedidos</h1>
        <p className="text-xs text-neutral-500 mt-1">
          Historial de compras realizadas y acceso directo a WhatsApp de la tienda.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-neutral-200 shadow-sm">
          <Package className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-neutral-800">No tienes pedidos aún</h3>
          <p className="text-xs text-neutral-500 mt-1 mb-5">
            ¡Agrega algunos productos y haz tu primer pedido!
          </p>
          <Link
            href="/"
            className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold text-xs shadow-sm hover:bg-emerald-700"
          >
            Ir al catálogo
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const waLink = generateCustomerOrderWhatsAppLink(
              storePhone,
              order.order_number,
              order.customer_name,
              order.total_amount,
              order.delivery_type,
              order.delivery_address,
              order.items
            );

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-sm space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-100 pb-3">
                  <div>
                    <span className="text-sm font-bold text-neutral-900">
                      Pedido #{order.order_number}
                    </span>
                    <span className="text-xs text-neutral-400 ml-2">
                      {new Date(order.created_at).toLocaleDateString('es-CL', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div>{getStatusBadge(order.status)}</div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-neutral-600">
                  <div className="flex items-center gap-2">
                    {order.delivery_type === 'delivery' ? (
                      <>
                        <MapPin className="w-4 h-4 text-neutral-400 shrink-0" />
                        <span>Envío a: <b>{order.delivery_address}</b></span>
                      </>
                    ) : (
                      <>
                        <Store className="w-4 h-4 text-neutral-400 shrink-0" />
                        <span>Retiro en Local</span>
                      </>
                    )}
                  </div>
                  <div className="text-right sm:text-right font-medium">
                    Total: <span className="text-base font-bold text-neutral-900 ml-1">{formatPrice(order.total_amount)}</span>
                  </div>
                </div>

                {/* Items */}
                {order.items && order.items.length > 0 && (
                  <div className="bg-neutral-50 rounded-xl p-3 text-xs space-y-1.5 border border-neutral-100">
                    <p className="font-semibold text-neutral-700 mb-1">Productos:</p>
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-neutral-600">
                        <span>{item.quantity}x {item.product_name}</span>
                        <span>{formatPrice(item.subtotal)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* WhatsApp Action Button */}
                <div className="pt-2 flex justify-end">
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold border border-emerald-200 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Reenviar a la tienda por WhatsApp</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
