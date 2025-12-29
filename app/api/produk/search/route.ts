import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('keyword');

    if (!keyword || keyword.length < 3) {
      return NextResponse.json([]);
    }

    // Search di tabel partlist dengan kolom yang sesuai
    const [rows] = await db.query(
      `SELECT * FROM partlist WHERE 
       produk LIKE ? OR 
       rated LIKE ? OR 
       produk1 LIKE ? OR 
       produk2 LIKE ? OR 
       produk3 LIKE ? OR 
       no_part LIKE ?
       ORDER BY LAST_UPDATE DESC
       LIMIT 50`,
      [`%${keyword}%`, `%${keyword}%`, `%${keyword}%`, `%${keyword}%`, `%${keyword}%`, `%${keyword}%`]
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error searching products:', error);
    return NextResponse.json({ error: 'Failed to search products' }, { status: 500 });
  }
}
