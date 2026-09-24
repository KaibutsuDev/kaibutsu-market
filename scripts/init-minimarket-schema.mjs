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
      ('Leche Entera 1L', 'Leche natural fresca pasteurizada', 1200, 25, true, 'Lácteos', 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop&q=60'),
      ('Pan Hallulla (1 Kg)', 'Pan tradicional recién horneado', 1990, 40, true, 'Panadería', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=60'),
      ('Bebida Cola 1.5L', 'Refrescante bebida gaseosa', 1650, 18, true, 'Bebidas', 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&auto=format&fit=crop&q=60'),
      ('Huevos Grado A (Docena)', 'Huevos frescos de campo seleccionados', 3400, 15, true, 'Huevos y Lácteos', 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=500&auto=format&fit=crop&q=60'),
      ('Arroz Grado 1 (1 Kg)', 'Arroz grano largo seleccionado grado 1', 1450, 30, true, 'Abarrotes', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=60'),
      ('Aceite Vegetal 900ml', 'Aceite comestible vegetal puro para cocinar', 2190, 12, true, 'Abarrotes', 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop&q=60');
    `;
    console.log('Productos iniciales sembrados con éxito.');
  }

  console.log('Inicialización completada al 100%.');
}

initMinimarketSchema();
