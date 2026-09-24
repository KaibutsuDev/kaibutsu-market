import { NextResponse } from 'next/server';
import { sql, OrderItem } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const auth = await getAuthUser();
    if (!auth) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    let orders;
    if (auth.role === 'admin' || auth.role === 'superadmin') {
      if (status && status !== 'all') {
        orders = await sql`
          SELECT * FROM minimarket.orders 
          WHERE status = ${status}
          ORDER BY created_at DESC
        `;
      } else {
        orders = await sql`
          SELECT * FROM minimarket.orders 
          ORDER BY created_at DESC
        `;
      }
    } else {
      // Cliente regular solo ve sus pedidos
      orders = await sql`
        SELECT * FROM minimarket.orders 
        WHERE customer_id = ${auth.userId}
        ORDER BY created_at DESC
      `;
    }

    // Traer los items de cada pedido
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const items = await sql`
          SELECT * FROM minimarket.order_items WHERE order_id = ${order.id}
        `;
        return { ...order, items };
      })
    );

    return NextResponse.json({ orders: ordersWithItems });
  } catch (error) {
    console.error('Error al listar pedidos:', error);
    return NextResponse.json({ error: 'Error al obtener pedidos' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = await getAuthUser();
    if (!auth) {
      return NextResponse.json(
        { error: 'Debes iniciar sesión para realizar un pedido' },
        { status: 401 }
      );
    }

    const {
      delivery_type,
      delivery_address,
      delivery_notes,
      items,
    }: {
      delivery_type: 'pickup' | 'delivery';
      delivery_address?: string;
      delivery_notes?: string;
      items: { product_id: string; quantity: number }[];
    } = await req.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'El carrito está vacío' }, { status: 400 });
    }

    if (delivery_type === 'delivery' && !delivery_address?.trim()) {
      return NextResponse.json(
        { error: 'Debes indicar una dirección para el envío a domicilio' },
        { status: 400 }
      );
    }

    // Obtener datos del cliente actual
    const userRows = await sql`
      SELECT id, full_name, phone, default_address 
      FROM minimarket.users 
      WHERE id = ${auth.userId}
    `;

    if (userRows.length === 0) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const customer = userRows[0];

    // 1. Validar disponibilidad y stock de cada producto
    let totalAmount = 0;
    const validatedItems: {
      product_id: string;
      product_name: string;
      unit_price: number;
      quantity: number;
      subtotal: number;
    }[] = [];

    for (const item of items) {
      const pRows = await sql`
        SELECT id, name, price, stock, is_available 
        FROM minimarket.products 
        WHERE id = ${item.product_id}
      `;

      if (pRows.length === 0) {
        return NextResponse.json(
          { error: `Un producto del carrito ya no existe` },
          { status: 400 }
        );
      }

      const prod = pRows[0];

      if (!prod.is_available) {
        return NextResponse.json(
          { error: `El producto "${prod.name}" no está disponible actualmente.` },
          { status: 400 }
        );
      }

      if (prod.stock < item.quantity) {
        return NextResponse.json(
          { error: `Stock insuficiente para "${prod.name}". Disponible: ${prod.stock}` },
          { status: 400 }
        );
      }

      const subtotal = prod.price * item.quantity;
      totalAmount += subtotal;

      validatedItems.push({
        product_id: prod.id,
        product_name: prod.name,
        unit_price: prod.price,
        quantity: item.quantity,
        subtotal,
      });
    }

    // 2. Crear el pedido
    const orderRows = await sql`
      INSERT INTO minimarket.orders 
      (customer_id, customer_name, customer_phone, delivery_type, delivery_address, delivery_notes, total_amount, status)
      VALUES (
        ${customer.id},
        ${customer.full_name},
        ${customer.phone},
        ${delivery_type},
        ${delivery_type === 'delivery' ? delivery_address?.trim() : null},
        ${delivery_notes?.trim() || null},
        ${totalAmount},
        'pending'
      )
      RETURNING *
    `;

    const order = orderRows[0];

    // 3. Insertar items y descontar stock inmediatamente
    for (const vItem of validatedItems) {
      await sql`
        INSERT INTO minimarket.order_items 
        (order_id, product_id, product_name, unit_price, quantity, subtotal)
        VALUES (
          ${order.id},
          ${vItem.product_id},
          ${vItem.product_name},
          ${vItem.unit_price},
          ${vItem.quantity},
          ${vItem.subtotal}
        )
      `;

      // Descontar stock
      await sql`
        UPDATE minimarket.products 
        SET stock = stock - ${vItem.quantity},
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${vItem.product_id}
      `;
    }

    return NextResponse.json({
      message: 'Pedido realizado con éxito',
      order: {
        ...order,
        items: validatedItems,
      },
    });
  } catch (error) {
    console.error('Error al crear pedido:', error);
    return NextResponse.json({ error: 'Error al procesar el pedido' }, { status: 500 });
  }
}
