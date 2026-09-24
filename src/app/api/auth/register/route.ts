import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { email, password, full_name, phone, default_address } = await req.json();

    if (!email || !password || !full_name || !phone) {
      return NextResponse.json(
        { error: 'Todos los campos obligatorios deben ser completados' },
        { status: 400 }
      );
    }

    // Verificar si el email ya existe
    const existing = await sql`
      SELECT id FROM minimarket.users WHERE email = ${email.toLowerCase().trim()}
    `;

    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'El correo electrónico ya se encuentra registrado' },
        { status: 400 }
      );
    }

    const password_hash = await bcrypt.hash(password, 10);

    const inserted = await sql`
      INSERT INTO minimarket.users (email, password_hash, full_name, phone, default_address, role)
      VALUES (${email.toLowerCase().trim()}, ${password_hash}, ${full_name.trim()}, ${phone.trim()}, ${default_address?.trim() || null}, 'customer')
      RETURNING id, email, full_name, phone, default_address, role
    `;

    const user = inserted[0];
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      full_name: user.full_name,
    });

    const response = NextResponse.json({
      message: 'Cuenta creada con éxito',
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        default_address: user.default_address,
        role: user.role,
      },
    });

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 días
    });

    return response;
  } catch (error) {
    console.error('Error en registro:', error);
    return NextResponse.json({ error: 'Error interno en el servidor' }, { status: 500 });
  }
}
