import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function inspectTables() {
  const tables = ['orders', 'order_items', 'products', 'users'];
  for (const t of tables) {
    const cols = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = ${t}
    `;
    console.log(`Columnas de ${t}:`, cols.map(c => `${c.column_name} (${c.data_type})`));
  }
}

inspectTables();
