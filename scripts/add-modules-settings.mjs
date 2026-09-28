import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function alterTable() {
  console.log('Agregando columnas de módulos opcionales a minimarket.store_settings...');
  await sql`
    ALTER TABLE minimarket.store_settings 
    ADD COLUMN IF NOT EXISTS module_ofertas_relampago BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS module_combos_dia BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS module_vitrina_pan BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS module_pedidos_programados BOOLEAN NOT NULL DEFAULT FALSE;
  `;

  const s = await sql`SELECT * FROM minimarket.store_settings WHERE id = 'current'`;
  console.log('Configuración actual con módulos:', s[0]);
}

alterTable().catch(console.error);
