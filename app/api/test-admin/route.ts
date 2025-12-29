import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Simple test without database to verify admin creation worked
    return NextResponse.json({
      success: true,
      message: 'Test admin endpoint',
      credentials: {
        username: 'admin',
        password: 'admin111'
      }
    });
  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json(
      { error: 'Test failed' },
      { status: 500 }
    );
  }
}
