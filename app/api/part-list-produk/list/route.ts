import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const [rows] = await db.query(`
      SELECT 
        id,
        noprod,
        produk_name,
        satuan,
        user_id,
        created_at,
        updated_at
      FROM partlist_produk 
      ORDER BY created_at DESC
    `);
    
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching part list produk:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
