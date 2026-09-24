import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthUser();
    if (!auth || (auth.role !== 'admin' && auth.role !== 'superadmin')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    // Permitir actualización parcial (ej. solo stock o solo disponibilidad)
    const { name, description, price, stock, is_available, category, image_url } = body;

    const current = await sql`SELECT * FROM minimarket.products WHERE id = ${id}`;
    if (current.length === 0) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
    }

    const cur = current[0];

    const updated = await sql`
      UPDATE minimarket.products
      SET 
        name = ${name !== undefined ? name.trim() : cur.name},
        description = ${description !== undefined ? description?.trim() : cur.description},
        price = ${price !== undefined ? Number(price) : cur.price},
        stock = ${stock !== undefined ? Number(stock) : cur.stock},
        is_available = ${is_available !== undefined ? Boolean(is_available) : cur.is_available},
        category = ${category !== undefined ? category.trim() : cur.category},
        image_url = ${image_url !== undefined ? image_url?.trim() : cur.image_url},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;

    return NextResponse.json({ product: updated[0] });
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    return NextResponse.json({ error: 'Error al actualizar producto' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthUser();
    if (!auth || (auth.role !== 'admin' && auth.role !== 'superadmin')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const { id } = await params;
    await sql`DELETE FROM minimarket.products WHERE id = ${id}`;

    return NextResponse.json({ message: 'Producto eliminado con éxito' });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    return NextResponse.json({ error: 'Error al eliminar producto' }, { status: 500 });
  }
}
