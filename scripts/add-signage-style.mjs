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
    await sql`ALTER TABLE minimarket.store_settings ADD COLUMN IF NOT EXISTS signage_style VARCHAR(50) DEFAULT 'hanging'`;
    console.log('Columna signage_style agregada o ya existente con éxito.');
    const rows = await sql`SELECT * FROM minimarket.store_settings WHERE id = 'current'`;
    console.log('Fila actual de store_settings:', rows[0]);
  } catch (e) {
    console.error('Error migrando:', e);
  }
}

runMigration();
