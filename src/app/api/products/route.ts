import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const availableOnly = searchParams.get('availableOnly') === 'true';

    // Obtener todos los productos y filtrar de forma tipada
    let products = await sql`
      SELECT * FROM minimarket.products ORDER BY name ASC
    `;

    if (availableOnly) {
      products = products.filter((p) => p.is_available && p.stock > 0);
    }

    if (category && category !== 'Todos') {
      products = products.filter((p) => p.category === category);
    }

    if (search) {
      const q = search.trim().toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    }

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Error al obtener productos:', error);
    return NextResponse.json({ error: 'Error al cargar productos' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = await getAuthUser();
    if (!auth || (auth.role !== 'admin' && auth.role !== 'superadmin')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const { name, description, price, stock, is_available, category, image_url } = await req.json();

    if (!name || price === undefined) {
      return NextResponse.json({ error: 'Nombre y precio son requeridos' }, { status: 400 });
    }

    const inserted = await sql`
      INSERT INTO minimarket.products 
      (name, description, price, stock, is_available, category, image_url)
      VALUES (
        ${name.trim()},
        ${description?.trim() || ''},
        ${Number(price)},
        ${Number(stock || 0)},
        ${is_available ?? true},
        ${category?.trim() || 'General'},
        ${image_url?.trim() || null}
      )
      RETURNING *
    `;

    return NextResponse.json({ product: inserted[0] });
  } catch (error) {
    console.error('Error al crear producto:', error);
    return NextResponse.json({ error: 'Error al crear producto' }, { status: 500 });
  }
}
