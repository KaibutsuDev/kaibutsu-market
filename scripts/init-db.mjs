import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config({ path: '.env.local' });

const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!databaseUrl) {
  console.error('DATABASE_URL no encontrada en .env.local');
  process.exit(1);
}

const sql = neon(databaseUrl);

async function initDB() {
  console.log('Iniciando migración y verificación de tablas...');

  try {
    // 1. Tabla de Usuarios
    await sql`
      CREATE TABLE IF NOT EXISTS users (
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

    // 2. Tabla de Productos
    await sql`
      CREATE TABLE IF NOT EXISTS products (
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

    // 3. Tabla de Pedidos
    await sql`
      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_number SERIAL,
        customer_id UUID REFERENCES users(id) ON DELETE SET NULL,
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

    // 4. Tabla de Items de Pedido
    await sql`
      CREATE TABLE IF NOT EXISTS order_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
        product_id UUID REFERENCES products(id) ON DELETE SET NULL,
        product_name VARCHAR(255) NOT NULL,
        unit_price INTEGER NOT NULL DEFAULT 0,
        quantity INTEGER NOT NULL DEFAULT 1,
        subtotal INTEGER NOT NULL DEFAULT 0
      );
    `;

    console.log('Tablas creadas exitosamente.');

    // 5. Crear usuario Vendedor (Familia / Admin) por defecto si no existe
    const adminEmail = 'admin@minimarket.cl';
    const existingAdmin = await sql`SELECT id FROM users WHERE email = ${adminEmail}`;

    if (existingAdmin.length === 0) {
      const passwordHash = await bcrypt.hash('admin1234', 10);
      await sql`
        INSERT INTO users (email, password_hash, full_name, phone, role)
        VALUES (${adminEmail}, ${passwordHash}, 'Administrador Tienda', '56912345678', 'admin');
      `;
      console.log('Usuario administrador creado: admin@minimarket.cl / admin1234');
    }

    // 6. Cargar productos iniciales de muestra si la tabla está vacía
    const productCount = await sql`SELECT count(*) FROM products`;
    if (parseInt(productCount[0].count, 10) === 0) {
      await sql`
        INSERT INTO products (name, description, price, stock, is_available, category, image_url)
        VALUES 
        ('Leche Entera 1L', 'Leche natural fresca pasteurizada', 1200, 25, true, 'Lácteos', 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop&q=60'),
        ('Pan Hallulla (1 Kg)', 'Pan tradicional recién horneado', 1990, 40, true, 'Panadería', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=60'),
        ('Bebida Cola 1.5L', 'Refrescante bebida gaseosa', 1650, 18, true, 'Bebidas', 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&auto=format&fit=crop&q=60'),
        ('Huevos Grado A (Docena)', 'Huevos frescos de campo', 3400, 15, true, 'Huevos y Lácteos', 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=500&auto=format&fit=crop&q=60'),
        ('Arroz Grado 1 (1 Kg)', 'Arroz grano largo seleccionado', 1450, 30, true, 'Abarrotes', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=60'),
        ('Aceite Vegetal 900ml', 'Aceite comestible puro para cocinar', 2190, 12, true, 'Abarrotes', 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop&q=60');
      `;
      console.log('Productos de prueba sembrados con éxito.');
    }

    console.log('Migración completada con éxito.');
  } catch (error) {
    console.error('Error durante la migración:', error);
    process.exit(1);
  }
}

initDB();
