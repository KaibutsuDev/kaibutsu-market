import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function resetProducts() {
  console.log('Actualizando catálogo de productos base...');

  // Eliminar productos anteriores
  await sql`DELETE FROM minimarket.products`;

  // Insertar frutas y verduras solicitadas
  await sql`
    INSERT INTO minimarket.products (name, description, price, stock, is_available, category, image_url)
    VALUES 
    ('Tomate Larga Vida (1 Kg)', 'Tomates frescos, firmes y jugosos de primera selección', 1890, 35, true, 'Verduras', 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop&q=60'),
    ('Lechuga Costina Fresca', 'Lechuga crujiente recién cosechada del día', 1200, 25, true, 'Verduras', 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=500&auto=format&fit=crop&q=60'),
    ('Repollo Morado / Verde', 'Repollo fresco entero ideal para ensaladas', 1600, 20, true, 'Verduras', 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=500&auto=format&fit=crop&q=60'),
    ('Papas Granel (2 Kg)', 'Papas seleccionadas especiales para cocer, freír o puré', 2490, 45, true, 'Verduras', 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500&auto=format&fit=crop&q=60'),
    ('Manzana Royal Gala (1 Kg)', 'Manzanas dulces y crujientes seleccionadas', 1990, 30, true, 'Frutas', 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500&auto=format&fit=crop&q=60'),
    ('Plátano Cavendish (1 Kg)', 'Plátanos maduros en su punto óptimo de dulzura', 1590, 40, true, 'Frutas', 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500&auto=format&fit=crop&q=60'),
    ('Naranja Valenciana (1 Kg)', 'Naranjas jugosas de temporada para jugo o postre', 1750, 30, true, 'Frutas', 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=500&auto=format&fit=crop&q=60')
  `;

  const prods = await sql`SELECT name, category, price, stock FROM minimarket.products ORDER BY name ASC`;
  console.log('Productos actualizados exitosamente:');
  console.table(prods);
}

resetProducts().catch(console.error);
