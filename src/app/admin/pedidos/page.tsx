'use client';

import { useEffect, useState } from 'react';
import { useToast } from '@/context/ToastContext';
import { Order } from '@/lib/db';
import { formatPrice, generateAdminContactCustomerWhatsAppLink } from '@/lib/whatsapp';
import {
  ShoppingBag,
  Trash2,
  CheckCircle2,
  RotateCcw,
  MessageCircle,
  MapPin,
  Store,
  Lock,
} from 'lucide-react';

export default function AdminPedidosPage() {
  const { showToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Modal de Eliminación de Pedido con PIN
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [deletePin, setDeletePin] = useState('');
  const [isDeletingOrder, setIsDeletingOrder] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      const url = selectedStatus === 'all' ? '/api/orders' : `/api/orders?status=${selectedStatus}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.orders) setOrders(data.orders);
    } catch (e) {
      console.error(e);
      showToast('Error al cargar pedidos', 'error');
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const statusLabel =
          newStatus === 'pending'
            ? 'Pendiente'
            : newStatus === 'confirmed' || newStatus === 'delivered'
            ? 'Completado'
            : 'Cancelado';
        showToast(`Pedido actualizado a: ${statusLabel}`, 'success');
        fetchOrders();
      } else {
        showToast('Error al actualizar estado del pedido', 'error');
      }
    } catch (e) {
      showToast('Error de red al actualizar pedido', 'error');
      console.error(e);
    }
  };

  const handleConfirmDeleteOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderToDelete) return;
    if (!deletePin.trim()) {
      showToast('Ingresa el PIN de seguridad', 'error');
      return;
    }

    setIsDeletingOrder(true);
    try {
      const res = await fetch(`/api/orders/${orderToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: deletePin.trim() }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast(`Pedido #${orderToDelete.order_number} eliminado correctamente`, 'success');
        setOrderToDelete(null);
        setDeletePin('');
        fetchOrders();
      } else {
        showToast(data.error || 'PIN incorrecto o error al eliminar', 'error');
      }
    } catch (e) {
      showToast('Error de conexión al eliminar pedido', 'error');
      console.error(e);
    } finally {
      setIsDeletingOrder(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [selectedStatus]);

  return (
    <div className="space-y-4">
      {/* Filtros de estado */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: 'all', label: 'Todos' },
          { id: 'pending', label: 'Pendientes' },
          { id: 'confirmed', label: 'Completados' },
          { id: 'cancelled', label: 'Cancelados' },
        ].map((st) => (
          <button
            key={st.id}
            onClick={() => setSelectedStatus(st.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedStatus === st.id
                ? 'bg-neutral-900 text-white'
                : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-100'
            }`}
          >
            {st.label}
          </button>
        ))}
      </div>

      {loadingOrders ? (
        <div className="py-16 text-center text-xs text-neutral-400">Cargando pedidos...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-neutral-200">
          <ShoppingBag className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-neutral-700">No hay pedidos con este filtro</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const whatsappAdminLink = generateAdminContactCustomerWhatsAppLink(
              order.customer_phone,
              order.order_number,
              order.customer_name,
              order.total_amount,
              order.delivery_type,
              order.delivery_address,
              order.items
            );

            const isCompleted = order.status === 'confirmed' || order.status === 'delivered';
            const isPending = order.status === 'pending';

            const displayStatusLabel = isCompleted
              ? 'Completado'
              : isPending
              ? 'Pendiente'
              : 'Cancelado';

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-sm space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-100 pb-3">
                  <div>
                    <span className="text-base font-bold text-neutral-900">
                      Pedido #{order.order_number}
                    </span>
                    <span className="text-xs text-neutral-400 ml-2">
                      {new Date(order.created_at).toLocaleDateString('es-CL', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {/* Botón WhatsApp hacia el cliente */}
                  <a
                    href={whatsappAdminLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all"
                  >
                    <MessageCircle className="w-4 h-4 fill-white" />
                    <span>Contactar Cliente por WhatsApp</span>
                  </a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-neutral-700">
                  <div>
                    <span className="text-neutral-400 block">Cliente:</span>
                    <span className="font-semibold text-neutral-900">{order.customer_name}</span>
                    <span className="block text-neutral-500 font-mono mt-0.5">
                      📞 {order.customer_phone}
                    </span>
                  </div>

                  <div>
                    <span className="text-neutral-400 block">Tipo de Entrega:</span>
                    <div className="flex items-center gap-1.5 font-semibold text-neutral-900 mt-0.5">
                      {order.delivery_type === 'delivery' ? (
                        <>
                          <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Envío a Domicilio</span>
                        </>
                      ) : (
                        <>
                          <Store className="w-4 h-4 text-blue-600 shrink-0" />
                          <span>Retiro en Local</span>
                        </>
                      )}
                    </div>
                    {order.delivery_address && (
                      <span className="text-neutral-500 block mt-0.5">
                        📍 {order.delivery_address}
                      </span>
                    )}
                    {order.delivery_notes && (
                      <span className="text-neutral-500 block italic mt-0.5">
                        Nota: &quot;{order.delivery_notes}&quot;
                      </span>
                    )}
                  </div>

                  <div className="text-left md:text-right">
                    <span className="text-neutral-400 block">Monto Total:</span>
                    <span className="text-lg font-bold text-emerald-700">
                      {formatPrice(order.total_amount)}
                    </span>
                    <span className="block text-[11px] font-bold mt-0.5">
                      Estado:{' '}
                      <span
                        className={
                          isCompleted
                            ? 'text-emerald-600'
                            : isPending
                            ? 'text-amber-600'
                            : 'text-red-600'
                        }
                      >
                        {displayStatusLabel}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Items del pedido */}
                {order.items && order.items.length > 0 && (
                  <div className="bg-neutral-50 rounded-xl p-3 text-xs space-y-1 border border-neutral-100">
                    <p className="font-semibold text-neutral-700 mb-1">Productos solicitados:</p>
                    {order.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between text-neutral-600">
                        <span>{it.quantity}x {it.product_name}</span>
                        <span>{formatPrice(it.subtotal)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Acciones de cambio de estado y eliminación */}
                <div className="pt-2 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs text-neutral-400">Gestionar pedido:</span>
                  <div className="flex items-center gap-2">
                    {!isCompleted && (
                      <button
                        onClick={() => handleUpdateOrderStatus(order.id, 'confirmed')}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold border border-emerald-200 transition-colors cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Marcar Completado</span>
                      </button>
                    )}

                    {!isPending && (
                      <button
                        onClick={() => handleUpdateOrderStatus(order.id, 'pending')}
                        className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 text-xs font-semibold border border-amber-200 transition-colors cursor-pointer"
                      >
                        Marcar Pendiente
                      </button>
                    )}

                    {order.status !== 'cancelled' && (
                      <button
                        onClick={() => handleUpdateOrderStatus(order.id, 'cancelled')}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-neutral-100 text-neutral-700 hover:bg-neutral-200 text-xs font-semibold border border-neutral-200 transition-colors cursor-pointer"
                        title="Cancela el pedido y devuelve el stock"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Cancelar</span>
                      </button>
                    )}

                    {/* Botón de Eliminación Segura con PIN */}
                    <button
                      type="button"
                      onClick={() => {
                        setOrderToDelete(order);
                        setDeletePin('');
                      }}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 text-xs font-semibold border border-red-200 transition-colors ml-1 cursor-pointer"
                      title="Eliminar pedido permanentemente"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Eliminar</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Eliminación con PIN */}
      {orderToDelete && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-xl border border-neutral-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-3">
              <Lock className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-neutral-900 text-center">
              Eliminar Pedido #{orderToDelete.order_number}
            </h3>
            <p className="text-xs text-neutral-500 text-center mt-1 mb-4 leading-relaxed">
              Esta acción eliminará el registro permanentemente. Por seguridad, ingresa el PIN de autorización para confirmar.
            </p>

            <form onSubmit={handleConfirmDeleteOrder} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5 text-center">
                  PIN de Seguridad
                </label>
                <input
                  type="password"
                  maxLength={6}
                  required
                  autoFocus
                  placeholder="••••"
                  value={deletePin}
                  onChange={(e) => setDeletePin(e.target.value)}
                  className="w-full text-center text-lg tracking-widest font-mono py-2.5 px-4 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  disabled={isDeletingOrder}
                  onClick={() => {
                    setOrderToDelete(null);
                    setDeletePin('');
                  }}
                  className="flex-1 py-2.5 rounded-xl text-neutral-600 hover:bg-neutral-100 text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isDeletingOrder || !deletePin}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isDeletingOrder ? 'Eliminando...' : 'Confirmar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
