import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthUser();
    if (!auth || (auth.role !== 'admin' && auth.role !== 'superadmin')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const { id } = await params;
    const { status }: { status: 'pending' | 'confirmed' | 'delivered' | 'cancelled' } = await req.json();

    if (!['pending', 'confirmed', 'delivered', 'cancelled'].includes(status)) {
      return NextResponse.json({ error: 'Estado de pedido inválido' }, { status: 400 });
    }

    const currentOrder = await sql`SELECT * FROM minimarket.orders WHERE id = ${id}`;
    if (currentOrder.length === 0) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
    }

    const oldStatus = currentOrder[0].status;

    // Si se cancela un pedido que no estaba cancelado, devolver stock
    if (status === 'cancelled' && oldStatus !== 'cancelled') {
      const items = await sql`SELECT product_id, quantity FROM minimarket.order_items WHERE order_id = ${id}`;
      for (const item of items) {
        if (item.product_id) {
          await sql`
            UPDATE minimarket.products
            SET stock = stock + ${item.quantity},
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ${item.product_id}
          `;
        }
      }
    }

    // Si se reabre un pedido cancelado, validar y volver a descontar stock
    if (oldStatus === 'cancelled' && status !== 'cancelled') {
      const items = await sql`SELECT product_id, quantity FROM minimarket.order_items WHERE order_id = ${id}`;
      for (const item of items) {
        if (item.product_id) {
          await sql`
            UPDATE minimarket.products
            SET stock = GREATEST(0, stock - ${item.quantity}),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ${item.product_id}
          `;
        }
      }
    }

    const updated = await sql`
      UPDATE minimarket.orders
      SET status = ${status}
      WHERE id = ${id}
      RETURNING *
    `;

    return NextResponse.json({ order: updated[0] });
  } catch (error) {
    console.error('Error al actualizar estado del pedido:', error);
    return NextResponse.json({ error: 'Error al actualizar pedido' }, { status: 500 });
  }
}
