import { NextRequest, NextResponse } from 'next/server';
import { logoutUser } from '@/lib/auth/login';

export async function POST(request: NextRequest) {
  try {
    logoutUser();

    return NextResponse.json({
      success: true,
      message: 'Logout berhasil'
    });

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
