'use client';

import { useCartStore } from '@/store/cartStore';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { formatPrice, generateCustomerOrderWhatsAppLink } from '@/lib/whatsapp';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, MapPin, Store, MessageCircle, AlertCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function CartPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { items, removeItem, updateQuantity, clearCart, getTotalPrice } = useCartStore();

  const [mounted, setMounted] = useState(false);
  const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery'>('pickup');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdOrder, setCreatedOrder] = useState<any | null>(null);

  useEffect(() => {
    setMounted(true);
    if (user?.default_address) {
      setDeliveryAddress(user.default_address);
    }
  }, [user]);

  if (!mounted) {
    return (
      <div className="py-20 text-center text-sm text-neutral-400">
        Cargando carrito...
      </div>
    );
  }

  // Vista de pedido exitoso con Botón de WhatsApp
  if (createdOrder) {
    const storePhone = process.env.NEXT_PUBLIC_STORE_PHONE || '56912345678';
    const whatsappLink = generateCustomerOrderWhatsAppLink(
      storePhone,
      createdOrder.order_number,
      createdOrder.customer_name,
      createdOrder.total_amount,
      createdOrder.delivery_type,
      createdOrder.delivery_address,
      createdOrder.items
    );

    return (
      <div className="max-w-xl mx-auto my-8 p-6 sm:p-8 bg-white rounded-3xl border border-neutral-200 shadow-sm text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
          ¡Pedido Registrado con Éxito!
        </h1>
        <p className="text-sm text-neutral-600 mt-2">
          Número de Pedido: <span className="font-bold text-neutral-900">#{createdOrder.order_number}</span>
        </p>

        <div className="my-6 p-4 rounded-2xl bg-neutral-50 text-left border border-neutral-100 space-y-2 text-xs text-neutral-700">
          <div className="flex justify-between">
            <span className="text-neutral-500">Entrega:</span>
            <span className="font-semibold capitalize">
              {createdOrder.delivery_type === 'delivery' ? 'Envío a Domicilio' : 'Retiro en Local'}
            </span>
          </div>
          {createdOrder.delivery_type === 'delivery' && (
            <div className="flex justify-between">
              <span className="text-neutral-500">Dirección:</span>
              <span className="font-semibold text-right">{createdOrder.delivery_address}</span>
            </div>
          )}
          <div className="flex justify-between pt-2 border-t border-neutral-200 text-sm">
            <span className="font-bold">Total a pagar:</span>
            <span className="font-bold text-emerald-700">{formatPrice(createdOrder.total_amount)}</span>
          </div>
        </div>

        <div className="space-y-3">
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group"
          >
            <MessageCircle className="w-5 h-5 fill-white" />
            <span>Enviar Pedido a la Tienda por WhatsApp</span>
          </a>

          <Link
            href="/orders"
            className="block w-full py-3 px-6 rounded-2xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold text-xs transition-colors"
          >
            Ver mis pedidos guardados
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto my-16 text-center bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-neutral-900">Tu carrito está vacío</h2>
        <p className="text-xs text-neutral-500 mt-1 mb-6">
          Explora los productos de nuestro minimarket y agrégalos a tu pedido.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-sm transition-all"
        >
          <span>Ir a comprar</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const handleCheckout = async () => {
    if (!user) {
      window.location.href = '/login?redirect=/cart';
      return;
    }

    if (deliveryType === 'delivery' && !deliveryAddress.trim()) {
      setError('Por favor indica la dirección de envío');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          delivery_type: deliveryType,
          delivery_address: deliveryAddress,
          delivery_notes: deliveryNotes,
          items: items.map((i) => ({
            product_id: i.product.id,
            quantity: i.quantity,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al procesar el pedido');
      }

      clearCart();
      setCreatedOrder(data.order);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Tu Carrito</h1>
        <button
          onClick={() => clearCart()}
          className="text-xs text-red-600 hover:underline font-medium"
        >
          Vaciar carrito
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map(({ product, quantity }) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl border border-neutral-200 p-4 flex items-center gap-4 shadow-sm"
            >
              <div className="w-20 h-20 bg-neutral-100 rounded-xl overflow-hidden shrink-0">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-neutral-400">
                    Sin foto
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-neutral-900 text-sm truncate">
                  {product.name}
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {formatPrice(product.price)} c/u • Stock: {product.stock}
                </p>
                <p className="text-sm font-bold text-neutral-900 mt-2">
                  {formatPrice(product.price * quantity)}
                </p>
              </div>

              {/* Quantity controls */}
              <div className="flex items-center gap-2 bg-neutral-100 p-1 rounded-xl">
                <button
                  onClick={() => {
                    updateQuantity(product.id, quantity - 1);
                    showToast(`Cantidad de ${product.name}: ${quantity - 1}`, 'info');
                  }}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-white text-neutral-700 shadow-xs hover:bg-neutral-50 transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-6 text-center text-xs font-bold text-neutral-800">
                  {quantity}
                </span>
                <button
                  onClick={() => {
                    if (quantity < product.stock) {
                      updateQuantity(product.id, quantity + 1);
                      showToast(`Cantidad de ${product.name}: ${quantity + 1}`, 'success');
                    } else {
                      showToast(`Stock máximo alcanzado para ${product.name}`, 'error');
                    }
                  }}
                  disabled={quantity >= product.stock}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-white text-neutral-700 shadow-xs hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Delete button */}
              <button
                onClick={() => {
                  removeItem(product.id);
                  showToast(`${product.name} eliminado del carrito`, 'info');
                }}
                className="p-2 text-neutral-400 hover:text-red-600 transition-colors"
                title="Eliminar"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Resumen & Selector de Entrega */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-sm space-y-4">
            <h2 className="font-bold text-neutral-900 text-base">Método de Entrega</h2>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDeliveryType('pickup')}
                className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border text-xs font-semibold transition-all ${
                  deliveryType === 'pickup'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                    : 'border-neutral-200 bg-neutral-50 text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                <Store className="w-5 h-5" />
                <span>Retiro en Local</span>
              </button>

              <button
                type="button"
                onClick={() => setDeliveryType('delivery')}
                className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border text-xs font-semibold transition-all ${
                  deliveryType === 'delivery'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                    : 'border-neutral-200 bg-neutral-50 text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                <MapPin className="w-5 h-5" />
                <span>Envío Domicilio</span>
              </button>
            </div>

            {deliveryType === 'delivery' && (
              <div className="space-y-2 pt-2 border-t border-neutral-100">
                <label className="block text-xs font-semibold text-neutral-700">
                  Dirección de Entrega *
                </label>
                <input
                  type="text"
                  required
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Calle, número, depto o referencia"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-neutral-700">
                Notas / Indicaciones (Opcional)
              </label>
              <textarea
                rows={2}
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                placeholder="Ej. Tocar timbre portón blanco o cambio para $20.000"
                className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div className="pt-3 border-t border-neutral-100 space-y-2">
              <div className="flex justify-between text-xs text-neutral-500">
                <span>Subtotal ({items.length} productos)</span>
                <span>{formatPrice(getTotalPrice())}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-neutral-900 pt-1">
                <span>Total Estimado</span>
                <span className="text-emerald-700">{formatPrice(getTotalPrice())}</span>
              </div>
            </div>

            {!user ? (
              <div className="space-y-2 pt-2">
                <Link
                  href="/login?redirect=/cart"
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <span>Iniciar sesión para confirmar</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <p className="text-[11px] text-center text-neutral-500">
                  ¿Eres nuevo?{' '}
                  <Link href="/register" className="text-emerald-700 font-semibold underline">
                    Crea tu cuenta gratis
                  </Link>
                </p>
              </div>
            ) : (
              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <span>{loading ? 'Procesando...' : 'Confirmar Pedido'}</span>
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
