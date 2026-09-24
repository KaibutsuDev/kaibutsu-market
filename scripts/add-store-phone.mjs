import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function alterTable() {
  console.log('Agregando store_phone a minimarket.store_settings...');
  await sql`
    ALTER TABLE minimarket.store_settings 
    ADD COLUMN IF NOT EXISTS store_phone VARCHAR(50) DEFAULT '56912345678';
  `;

  const s = await sql`SELECT * FROM minimarket.store_settings WHERE id = 'current'`;
  console.log('Configuración actual:', s[0]);
}

alterTable().catch(console.error);
