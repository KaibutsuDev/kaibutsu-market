import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function initSettings() {
  console.log('Creando tabla minimarket.store_settings...');
  await sql`
    CREATE TABLE IF NOT EXISTS minimarket.store_settings (
      id VARCHAR(50) PRIMARY KEY DEFAULT 'current',
      is_open BOOLEAN NOT NULL DEFAULT TRUE,
      schedule_text VARCHAR(255) NOT NULL DEFAULT 'Lunes a Sábado: 09:00 - 21:00 hrs',
      announcement_text TEXT DEFAULT '¡Bienvenidos! Recibiendo pedidos con normalidad.',
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await sql`
    INSERT INTO minimarket.store_settings (id, is_open, schedule_text, announcement_text)
    VALUES ('current', true, 'Lunes a Sábado: 09:00 - 21:00 hrs | Domingo: 10:00 - 15:00 hrs', '¡Estamos atendiendo pedidos con entrega rápida y retiro!')
    ON CONFLICT (id) DO UPDATE 
    SET schedule_text = EXCLUDED.schedule_text;
  `;

  const s = await sql`SELECT * FROM minimarket.store_settings WHERE id = 'current'`;
  console.log('Configuración de tienda inicializada:', s[0]);
}

initSettings().catch(console.error);
