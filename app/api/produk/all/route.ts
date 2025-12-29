import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Get all products from partlist table
    const [rows] = await db.query(
      `SELECT * FROM partlist ORDER BY LAST_UPDATE DESC LIMIT 100`
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching all products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
