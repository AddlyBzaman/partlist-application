import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/login';

export async function GET(request: NextRequest) {
  try {
    const session = getSession();

    return NextResponse.json({
      success: true,
      session
    });

  } catch (error) {
    console.error('Session error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
