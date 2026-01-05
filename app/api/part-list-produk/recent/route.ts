import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const userId = url.searchParams.get('userId');

    let query = `
      SELECT 
        id,
        noprod,
        produk_name,
        satuan,
        user_id,
        created_at,
        updated_at,
        (SELECT COUNT(*) FROM partlist_produk_items WHERE produk_id = partlist_produk.id) as items_count
      FROM partlist_produk 
      ORDER BY created_at DESC
      LIMIT ?
    `;

    const [rows] = await db.query(query, [limit]);
    
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching recent part list produk:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
