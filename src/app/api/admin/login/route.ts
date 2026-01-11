import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, createToken } from '@/lib/auth';

// POST /api/admin/login
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json(
      { error: 'Email ve sifre gerekli' },
      { status: 400 }
    );
  }

  const admin = await prisma.admin.findUnique({
    where: { email },
  });

  if (!admin) {
    return NextResponse.json(
      { error: 'Gecersiz email veya sifre' },
      { status: 401 }
    );
  }

  const isValid = await verifyPassword(password, admin.password);

  if (!isValid) {
    return NextResponse.json(
      { error: 'Gecersiz email veya sifre' },
      { status: 401 }
    );
  }

  const token = createToken({
    id: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role,
  });

  const response = NextResponse.json({
    user: {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    },
  });

  response.cookies.set('admin_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 gun
    path: '/',
  });

  return response;
}
