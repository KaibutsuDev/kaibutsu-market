import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function checkUsers() {
  const users = await sql`SELECT * FROM users LIMIT 5`;
  console.log('Usuarios existentes:', users);
  const type = await sql`
    SELECT t.typname, e.enumlabel
    FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    JOIN information_schema.columns c ON c.udt_name = t.typname
    WHERE c.table_name = 'users' AND c.column_name = 'role'
  `;
  console.log('Enum para role:', type);
}

checkUsers();
