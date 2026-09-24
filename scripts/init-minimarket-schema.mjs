import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function initMinimarketSchema() {
  console.log('Creando esquema específico "minimarket" para aislar la aplicación...');

  // 1. Crear schema minimarket
  await sql`CREATE SCHEMA IF NOT EXISTS minimarket;`;

  // 2. Tabla users en schema minimarket
  await sql`
    CREATE TABLE IF NOT EXISTS minimarket.users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name VARCHAR(255) NOT NULL,
      phone VARCHAR(50) NOT NULL,
      default_address TEXT,
      role VARCHAR(50) NOT NULL DEFAULT 'customer',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  // 3. Tabla products en schema minimarket
  await sql`
    CREATE TABLE IF NOT EXISTS minimarket.products (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      description TEXT,
      price INTEGER NOT NULL DEFAULT 0,
      stock INTEGER NOT NULL DEFAULT 0,
      is_available BOOLEAN NOT NULL DEFAULT TRUE,
      image_url TEXT,
      category VARCHAR(100) DEFAULT 'General',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  // 4. Tabla orders en schema minimarket
  await sql`
    CREATE TABLE IF NOT EXISTS minimarket.orders (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      order_number SERIAL,
      customer_id UUID REFERENCES minimarket.users(id) ON DELETE SET NULL,
      customer_name VARCHAR(255) NOT NULL,
      customer_phone VARCHAR(50) NOT NULL,
      delivery_type VARCHAR(50) NOT NULL,
      delivery_address TEXT,
      delivery_notes TEXT,
      total_amount INTEGER NOT NULL DEFAULT 0,
      status VARCHAR(50) NOT NULL DEFAULT 'pending',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  // 5. Tabla order_items en schema minimarket
  await sql`
    CREATE TABLE IF NOT EXISTS minimarket.order_items (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      order_id UUID REFERENCES minimarket.orders(id) ON DELETE CASCADE,
      product_id UUID REFERENCES minimarket.products(id) ON DELETE SET NULL,
      product_name VARCHAR(255) NOT NULL,
      unit_price INTEGER NOT NULL DEFAULT 0,
      quantity INTEGER NOT NULL DEFAULT 1,
      subtotal INTEGER NOT NULL DEFAULT 0
    );
  `;

  console.log('Tablas en schema minimarket creadas con éxito.');

  // 6. Admin por defecto
  const adminEmail = 'admin@minimarket.cl';
  const existingAdmin = await sql`SELECT id FROM minimarket.users WHERE email = ${adminEmail}`;

  if (existingAdmin.length === 0) {
    const passwordHash = await bcrypt.hash('admin1234', 10);
    await sql`
      INSERT INTO minimarket.users (email, password_hash, full_name, phone, role)
      VALUES (${adminEmail}, ${passwordHash}, 'Familia Minimarket (Admin)', '56912345678', 'admin');
    `;
    console.log('Admin creado: admin@minimarket.cl / admin1234');
  }

  // 7. Productos iniciales
  const productCount = await sql`SELECT count(*) FROM minimarket.products`;
  if (parseInt(productCount[0].count, 10) === 0) {
    await sql`
      INSERT INTO minimarket.products (name, description, price, stock, is_available, category, image_url)
      VALUES 
      ('Tomate Larga Vida (1 Kg)', 'Tomates frescos, firmes y jugosos de primera selección', 1890, 35, true, 'Verduras', 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop&q=60'),
      ('Lechuga Costina Fresca', 'Lechuga crujiente recién cosechada del día', 1200, 25, true, 'Verduras', 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=500&auto=format&fit=crop&q=60'),
      ('Repollo Morado / Verde', 'Repollo fresco entero ideal para ensaladas', 1600, 20, true, 'Verduras', 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=500&auto=format&fit=crop&q=60'),
      ('Papas Granel (2 Kg)', 'Papas seleccionadas especiales para cocer, freír o puré', 2490, 45, true, 'Verduras', 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500&auto=format&fit=crop&q=60'),
      ('Manzana Royal Gala (1 Kg)', 'Manzanas dulces y crujientes seleccionadas', 1990, 30, true, 'Frutas', 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500&auto=format&fit=crop&q=60'),
      ('Plátano Cavendish (1 Kg)', 'Plátanos maduros en su punto óptimo de dulzura', 1590, 40, true, 'Frutas', 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500&auto=format&fit=crop&q=60'),
      ('Naranja Valenciana (1 Kg)', 'Naranjas jugosas de temporada para jugo o postre', 1750, 30, true, 'Frutas', 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=500&auto=format&fit=crop&q=60');
    `;
    console.log('Productos iniciales sembrados con éxito.');
  }

  console.log('Inicialización completada al 100%.');
}

initMinimarketSchema();
