import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { searchCache } from '@/lib/cache/CacheService';

// Node.js runtime for database operations
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const keyword = request.headers.get('x-keyword');

    if (!keyword || keyword.length < 3) {
      return NextResponse.json([]);
    }

    // Check cache first
    const cacheKey = `produk_search_${keyword}`;
    const cachedResult = searchCache.get(cacheKey);
    
    if (cachedResult) {
      console.log('Cache hit for:', keyword);
      return NextResponse.json(cachedResult);
    }

    console.log('Cache miss, querying database for:', keyword);
    
    // Search di tabel partlist dengan kolom yang sesuai
    const [rows] = await db.query(
      `SELECT * FROM partlist WHERE 
       NOPROD LIKE ? OR 
       PRODUK LIKE ? OR 
       RATED LIKE ? OR 
       PRODUK1 LIKE ? OR 
       PRODUK2 LIKE ? OR 
       PRODUK3 LIKE ? OR 
       NO_PART LIKE ?
       ORDER BY PRODUK ASC
       LIMIT 50`,
      [`%${keyword}%`, `%${keyword}%`, `%${keyword}%`, `%${keyword}%`, `%${keyword}%`, `%${keyword}%`, `%${keyword}%`]
    ) as any[];

    // Cache the result
    searchCache.set(cacheKey, rows);

    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error searching products:', error);
    return NextResponse.json({ error: 'Failed to search products' }, { status: 500 });
  }
}
