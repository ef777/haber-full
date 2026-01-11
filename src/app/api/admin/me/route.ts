import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';

// GET /api/admin/me
export async function GET() {
  const user = await getAuthUser();

  if (!user) {
    return NextResponse.json({ error: 'Yetkisiz erisim' }, { status: 401 });
  }

  return NextResponse.json({ user });
}
