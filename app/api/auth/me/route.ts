import { NextResponse } from 'next/server';
import { backendFetch, BackendError } from '@/lib/api';

export async function GET() {
  try {
    const admin = await backendFetch('/admin-auth/me');
    return NextResponse.json(admin);
  } catch (error) {
    const status = error instanceof BackendError ? error.status : 502;
    return NextResponse.json({ message: 'Not authenticated.' }, { status });
  }
}
