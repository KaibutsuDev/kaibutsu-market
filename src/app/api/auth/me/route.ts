import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const auth = await getAuthUser();
    if (!auth) {
      return NextResponse.json({ user: null });
    }

    const rows = await sql`
      SELECT id, email, full_name, phone, default_address, role
      FROM minimarket.users
      WHERE id = ${auth.userId}
    `;

    if (rows.length === 0) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({ user: rows[0] });
  } catch (error) {
    console.error('Error al obtener usuario actual:', error);
    return NextResponse.json({ user: null });
  }
}

export async function POST() {
  // Logout
  const response = NextResponse.json({ message: 'Sesión cerrada' });
  response.cookies.set('auth_token', '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/',
  });
  return response;
}
