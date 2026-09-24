import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function GET() {
  try {
    const rows = await sql`
      SELECT * FROM minimarket.store_settings WHERE id = 'current'
    `;
    if (rows.length === 0) {
      return NextResponse.json({
        settings: {
          is_open: true,
          schedule_text: 'Lunes a Sábado: 09:00 - 21:00 hrs',
          announcement_text: '¡Estamos atendiendo pedidos!',
        },
      });
    }
    return NextResponse.json({ settings: rows[0] });
  } catch (error) {
    console.error('Error al obtener configuración de tienda:', error);
    return NextResponse.json({ error: 'Error al cargar horarios' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const auth = await getAuthUser();
    if (!auth || (auth.role !== 'admin' && auth.role !== 'superadmin')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const { is_open, schedule_text, announcement_text } = await req.json();

    const updated = await sql`
      UPDATE minimarket.store_settings
      SET 
        is_open = ${is_open !== undefined ? Boolean(is_open) : true},
        schedule_text = ${schedule_text !== undefined ? schedule_text.trim() : 'Lunes a Sábado: 09:00 - 21:00 hrs'},
        announcement_text = ${announcement_text !== undefined ? announcement_text.trim() : ''},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = 'current'
      RETURNING *
    `;

    return NextResponse.json({ settings: updated[0] });
  } catch (error) {
    console.error('Error al actualizar configuración de tienda:', error);
    return NextResponse.json({ error: 'Error al actualizar horarios' }, { status: 500 });
  }
}
