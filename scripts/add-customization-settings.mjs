import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!databaseUrl) {
  console.error('DATABASE_URL no encontrada en .env.local');
  process.exit(1);
}

const sql = neon(databaseUrl);

async function runMigration() {
  try {
    await sql`ALTER TABLE minimarket.store_settings ADD COLUMN IF NOT EXISTS store_name VARCHAR(150) DEFAULT 'Kaibutsu Market'`;
    await sql`ALTER TABLE minimarket.store_settings ADD COLUMN IF NOT EXISTS store_tagline TEXT DEFAULT 'Tu almacén con pedidos por WhatsApp'`;
    await sql`ALTER TABLE minimarket.store_settings ADD COLUMN IF NOT EXISTS hero_title TEXT DEFAULT 'Pide en línea y confirma directo por WhatsApp'`;
    await sql`ALTER TABLE minimarket.store_settings ADD COLUMN IF NOT EXISTS hero_subtitle TEXT DEFAULT 'Elige tus productos, agrega al carrito y coordina la entrega directamente con nosotros.'`;
    await sql`ALTER TABLE minimarket.store_settings ADD COLUMN IF NOT EXISTS theme_color VARCHAR(50) DEFAULT 'emerald'`;
    await sql`ALTER TABLE minimarket.store_settings ADD COLUMN IF NOT EXISTS logo_url TEXT DEFAULT ''`;

    console.log('Columnas de personalización agregadas con éxito.');
    const rows = await sql`SELECT * FROM minimarket.store_settings WHERE id = 'current'`;
    console.log('Fila actual de store_settings:', rows[0]);
  } catch (e) {
    console.error('Error migrando:', e);
  }
}

runMigration();
