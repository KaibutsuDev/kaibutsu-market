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
          store_phone: '56912345678',
          schedule_text: 'Lunes a Sábado: 09:00 - 21:00 hrs',
          announcement_text: '¡Estamos atendiendo pedidos!',
          module_ofertas_relampago: false,
          module_combos_dia: false,
          module_vitrina_pan: false,
          module_pedidos_programados: false,
          signage_style: 'hanging',
        },
      });
    }
    return NextResponse.json({ settings: rows[0] });
  } catch (error) {
    console.error('Error al obtener configuración de tienda:', error);
    return NextResponse.json({ error: 'Error al cargar configuración' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const auth = await getAuthUser();
    if (!auth || (auth.role !== 'admin' && auth.role !== 'superadmin')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const {
      is_open,
      store_phone,
      schedule_text,
      announcement_text,
      module_ofertas_relampago,
      module_combos_dia,
      module_vitrina_pan,
      module_pedidos_programados,
      signage_style,
    } = await req.json();

    const updated = await sql`
      UPDATE minimarket.store_settings
      SET 
        is_open = ${is_open !== undefined ? Boolean(is_open) : true},
        store_phone = ${store_phone !== undefined ? store_phone.trim() : '56912345678'},
        schedule_text = ${schedule_text !== undefined ? schedule_text.trim() : 'Lunes a Sábado: 09:00 - 21:00 hrs'},
        announcement_text = ${announcement_text !== undefined ? announcement_text.trim() : ''},
        module_ofertas_relampago = ${module_ofertas_relampago !== undefined ? Boolean(module_ofertas_relampago) : false},
        module_combos_dia = ${module_combos_dia !== undefined ? Boolean(module_combos_dia) : false},
        module_vitrina_pan = ${module_vitrina_pan !== undefined ? Boolean(module_vitrina_pan) : false},
        module_pedidos_programados = ${module_pedidos_programados !== undefined ? Boolean(module_pedidos_programados) : false},
        signage_style = ${signage_style !== undefined ? signage_style.trim() : 'hanging'},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = 'current'
      RETURNING *
    `;

    return NextResponse.json({ settings: updated[0] });
  } catch (error) {
    console.error('Error al actualizar configuración de tienda:', error);
    return NextResponse.json({ error: 'Error al actualizar configuración' }, { status: 500 });
  }
}
