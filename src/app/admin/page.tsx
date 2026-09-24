'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Product, Order } from '@/lib/db';
import { formatPrice, generateAdminContactCustomerWhatsAppLink } from '@/lib/whatsapp';
import {
  Package,
  Layers,
  ShoppingBag,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  MessageCircle,
  Clock,
  CheckCircle2,
  Phone,
  MapPin,
  Store,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'settings'>('orders');

  // Horario y Tienda
  const [storeSettings, setStoreSettings] = useState({
    is_open: true,
    store_phone: '56912345678',
    schedule_text: '',
    announcement_text: '',
  });
  const [savingSettings, setSavingSettings] = useState(false);

  // Pedidos
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Productos
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Modal / Formulario de Producto
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    is_available: true,
    category: 'General',
    image_url: '',
  });

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      const url = selectedStatus === 'all' ? '/api/orders' : `/api/orders?status=${selectedStatus}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.orders) setOrders(data.orders);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.products) setProducts(data.products);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.settings) {
        setStoreSettings({
          is_open: data.settings.is_open,
          store_phone: data.settings.store_phone || '56912345678',
          schedule_text: data.settings.schedule_text || '',
          announcement_text: data.settings.announcement_text || '',
        });
      }
    } catch (e) {
      console.error(e);
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
    if (!authLoading && user && (user.role === 'admin' || user.role === 'superadmin')) {
      fetchOrders();
      fetchProducts();
      fetchSettings();
    }
  }, [authLoading, user, selectedStatus]);

  if (authLoading) {
    return <div className="py-20 text-center text-sm text-neutral-400">Verificando credenciales...</div>;
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

  // Acciones en pedidos
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        showToast(`Pedido actualizado a estado: ${newStatus}`, 'success');
        fetchOrders();
        fetchProducts(); // refrescar stock por si hubo reintegro
      } else {
        showToast('Error al actualizar estado del pedido', 'error');
      }
    } catch (e) {
      showToast('Error de red al actualizar pedido', 'error');
      console.error(e);
    }
  };

  // Acciones en productos
  const handleToggleProductAvailability = async (product: Product) => {
    try {
      const nextState = !product.is_available;
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_available: nextState }),
      });
      if (res.ok) {
        showToast(
          `"${product.name}" marcado como ${nextState ? 'Disponible' : 'Agotado'}`,
          nextState ? 'success' : 'info'
        );
        fetchProducts();
      } else {
        showToast('Error al cambiar disponibilidad', 'error');
      }
    } catch (e) {
      showToast('Error al cambiar disponibilidad', 'error');
      console.error(e);
    }
  };

  const handleUpdateProductStock = async (product: Product, newStock: number) => {
    if (newStock < 0) return;
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: newStock }),
      });
      if (res.ok) {
        showToast(`Stock de "${product.name}" actualizado a ${newStock} un.`, 'success');
        fetchProducts();
      } else {
        showToast('Error al actualizar stock', 'error');
      }
    } catch (e) {
      showToast('Error al actualizar stock', 'error');
      console.error(e);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('¿Seguro que deseas eliminar este producto del catálogo?')) return;
    try {
      const res = await fetch(`/api/products/${productId}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Producto eliminado del catálogo', 'info');
        fetchProducts();
      } else {
        showToast('Error al eliminar producto', 'error');
      }
    } catch (e) {
      showToast('Error al eliminar producto', 'error');
      console.error(e);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        // Editar
        const res = await fetch(`/api/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          showToast(`Producto "${formData.name}" actualizado con éxito`, 'success');
        } else {
          showToast('Error al guardar cambios del producto', 'error');
        }
      } else {
        // Crear
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          showToast(`Producto "${formData.name}" añadido al catálogo`, 'success');
        } else {
          showToast('Error al crear el producto', 'error');
        }
      }
      setIsProductModalOpen(false);
      setEditingProduct(null);
      fetchProducts();
    } catch (e) {
      showToast('Error de conexión al guardar producto', 'error');
      console.error(e);
    }
  };

  const openCreateProduct = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: 1000,
      stock: 10,
      is_available: true,
      category: 'General',
      image_url: '',
    });
    setIsProductModalOpen(true);
  };

  const openEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name,
      description: prod.description || '',
      price: prod.price,
      stock: prod.stock,
      is_available: prod.is_available,
      category: prod.category || 'General',
      image_url: prod.image_url || '',
    });
    setIsProductModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-neutral-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Panel del Vendedor</h1>
          <p className="text-xs text-neutral-500">
            Control de inventario, stock en tiempo real y atención directa a clientes por WhatsApp.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-neutral-100 p-1.5 rounded-2xl">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'orders'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-emerald-600" />
            <span>Pedidos Recibidos</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'products'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Layers className="w-4 h-4 text-emerald-600" />
            <span>Inventario / Stock</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'settings'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>Horarios & Estado</span>
          </button>
        </div>
      </div>

      {/* VISTA 1: PEDIDOS */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {/* Filtros de estado */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {['all', 'pending', 'confirmed', 'delivered', 'cancelled'].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-all ${
                  selectedStatus === st
                    ? 'bg-neutral-900 text-white'
                    : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-100'
                }`}
              >
                {st === 'all'
                  ? 'Todos'
                  : st === 'pending'
                  ? 'Pendientes'
                  : st === 'confirmed'
                  ? 'Confirmados'
                  : st === 'delivered'
                  ? 'Entregados'
                  : 'Cancelados'}
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
                        <span className="block text-[11px] text-neutral-400 uppercase font-semibold">
                          Estado: {order.status}
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

                    {/* Acciones de cambio de estado */}
                    <div className="pt-2 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs text-neutral-400">Cambiar estado del pedido:</span>
                      <div className="flex items-center gap-2">
                        {order.status !== 'confirmed' && order.status !== 'delivered' && (
                          <button
                            onClick={() => handleUpdateOrderStatus(order.id, 'confirmed')}
                            className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold border border-blue-200 transition-colors"
                          >
                            Marcar Confirmado
                          </button>
                        )}

                        {order.status !== 'delivered' && (
                          <button
                            onClick={() => handleUpdateOrderStatus(order.id, 'delivered')}
                            className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold border border-emerald-200 transition-colors"
                          >
                            Marcar Entregado
                          </button>
                        )}

                        {order.status !== 'cancelled' && (
                          <button
                            onClick={() => handleUpdateOrderStatus(order.id, 'cancelled')}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 text-xs font-semibold border border-red-200 transition-colors"
                            title="Reintegra el stock de los productos"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Cancelar (Devuelve Stock)</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VISTA 2: PRODUCTOS E INVENTARIO */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-neutral-900">Catálogo de Productos ({products.length})</h2>
            <button
              onClick={openCreateProduct}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Añadir Producto</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Producto</th>
                    <th className="py-3 px-4">Categoría</th>
                    <th className="py-3 px-4">Precio</th>
                    <th className="py-3 px-4">Stock</th>
                    <th className="py-3 px-4">Disponibilidad</th>
                    <th className="py-3 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {products.map((prod) => (
                    <tr key={prod.id} className="hover:bg-neutral-50/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-neutral-100 overflow-hidden shrink-0">
                            {prod.image_url ? (
                              <img src={prod.image_url} alt={prod.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] text-neutral-400">
                                Sin foto
                              </div>
                            )}
                          </div>
                          <div>
                            <span className="font-semibold text-neutral-900 block">{prod.name}</span>
                            <span className="text-[11px] text-neutral-400 truncate max-w-xs block">
                              {prod.description}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-neutral-600">{prod.category}</td>
                      <td className="py-3 px-4 font-bold text-neutral-900">{formatPrice(prod.price)}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min="0"
                            value={prod.stock}
                            onChange={(e) => handleUpdateProductStock(prod, Number(e.target.value))}
                            className="w-16 px-2 py-1 rounded-lg border border-neutral-200 text-xs font-semibold text-center focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                          <span className="text-neutral-400 text-[11px]">un.</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleProductAvailability(prod)}
                          className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all ${
                            prod.is_available && prod.stock > 0
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                              : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                          }`}
                        >
                          {prod.is_available && prod.stock > 0 ? 'Disponible' : 'Agotado'}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditProduct(prod)}
                            className="p-1.5 text-neutral-500 hover:text-emerald-700 rounded-lg hover:bg-neutral-100"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(prod.id)}
                            className="p-1.5 text-neutral-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VISTA 3: CONFIGURACIÓN DE HORARIOS & ESTADO DE ATENCIÓN */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 shadow-sm max-w-2xl">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-neutral-900">Horario de Atención y Estado del Local</h2>
            <p className="text-xs text-neutral-500 mt-1">
              Controla el cartel visible para los clientes con el estado de apertura y los horarios comerciales.
            </p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-5">
            {/* Switch de Estado Abierto / Cerrado con Cartel Previo */}
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

            {/* Vista Previa del Cartel */}
            <div className="pt-2">
              <span className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
                Vista previa del cartel:
              </span>
              <div className="p-4 rounded-2xl border border-neutral-200 bg-white shadow-xs flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-neutral-100 text-emerald-600">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-neutral-400 uppercase block">Horario</span>
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

                <div>
                  {storeSettings.is_open ? (
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                      </span>
                      <span className="text-[11px] font-black uppercase tracking-wider">
                        ● Atendiendo
                      </span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-700">
                      <span className="h-2 w-2 rounded-full bg-red-500"></span>
                      <span className="text-[11px] font-black uppercase tracking-wider">
                        Cerrado
                      </span>
                    </div>
                  )}
                </div>
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
      )}

      {/* Modal Añadir / Editar Producto */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-neutral-200 p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-bold text-neutral-900 mb-4">
              {editingProduct ? 'Editar Producto' : 'Añadir Nuevo Producto'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Nombre *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Descripción</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Precio (CLP) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Stock Inicial *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Categoría</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Ej. Bebidas, Lácteos"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-neutral-700">
                    <input
                      type="checkbox"
                      checked={formData.is_available}
                      onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Disponible venta</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">URL de Imagen</label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-neutral-600 hover:bg-neutral-100 text-xs font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
