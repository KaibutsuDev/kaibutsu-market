'use client';

import { useEffect, useState } from 'react';
import { useToast } from '@/context/ToastContext';
import { Product } from '@/lib/db';
import { formatPrice } from '@/lib/whatsapp';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export default function AdminInventarioPage() {
  const { showToast } = useToast();
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

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.products) setProducts(data.products);
    } catch (e) {
      console.error(e);
      showToast('Error al cargar productos', 'error');
    } finally {
      setLoadingProducts(false);
    }
  };

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

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-neutral-900">Catálogo de Productos ({products.length})</h2>
          <p className="text-xs text-neutral-500">Administra precios, existencias y disponibilidad al instante.</p>
        </div>
        <button
          onClick={openCreateProduct}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Añadir Producto</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
        {loadingProducts ? (
          <div className="py-16 text-center text-xs text-neutral-400">Cargando inventario...</div>
        ) : products.length === 0 ? (
          <div className="py-16 text-center text-xs text-neutral-500">No hay productos registrados aún.</div>
        ) : (
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
                        className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
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
                          className="p-1.5 text-neutral-500 hover:text-emerald-700 rounded-lg hover:bg-neutral-100 cursor-pointer"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(prod.id)}
                          className="p-1.5 text-neutral-400 hover:text-red-600 rounded-lg hover:bg-red-50 cursor-pointer"
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
        )}
      </div>

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
                  className="px-4 py-2 rounded-xl text-neutral-600 hover:bg-neutral-100 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
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
