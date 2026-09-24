import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!databaseUrl) {
  console.warn('DATABASE_URL is not set in environment variables');
}

export const sql = neon(databaseUrl || '');

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  default_address?: string;
  role: 'customer' | 'admin' | 'superadmin';
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  is_available: boolean;
  image_url: string;
  category: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id?: string;
  order_id?: string;
  product_id: string;
  product_name: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: string;
  order_number: number;
  customer_id?: string;
  customer_name: string;
  customer_phone: string;
  delivery_type: 'pickup' | 'delivery';
  delivery_address?: string;
  delivery_notes?: string;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
  created_at: string;
  items?: OrderItem[];
}
