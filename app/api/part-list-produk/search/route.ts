import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { bahanCache } from '@/lib/cache/CacheService';

// Node.js runtime for database operations
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Get keyword from headers instead of URL to avoid dynamic server usage
    const keyword = request.headers.get('x-keyword');

    if (!keyword || keyword.length < 2) {
      return NextResponse.json([]);
    }

    // Check cache first
    const cacheKey = `bahan_search_${keyword}`;
    const cachedResult = bahanCache.get(cacheKey);
    
    if (cachedResult) {
      console.log('Cache hit for bahan:', keyword);
      return NextResponse.json(cachedResult);
    }

    console.log('Cache miss, querying database for bahan:', keyword);

    const [rows] = await db.query(
      `SELECT 
        id,
        CODE as kode_lama,
        CODE_BARU as kode_baru,
        LNAMA as nama_bahan,
        SPEK as spesifikasi,
        UNIT as unit,
        pakaiperpcs,
        BDOWN
      FROM partlist_a 
      WHERE CODE LIKE ? OR LNAMA LIKE ?
      ORDER BY LNAMA ASC
      LIMIT 20`,
      [`%${keyword}%`, `%${keyword}%`]
    );

    const transformedResults = (rows as any[]).map((item: any) => ({
      id: item.id,
      kode_lama: item.kode_lama,
      kode_baru: item.kode_baru,
      nama_bahan: item.nama_bahan || '',
      spesifikasi: item.spesifikasi || '',
      unit: item.unit || '',
      pakaiperpcs: item.pakaiperpcs || '',
      BDOWN: item.BDOWN || '',
    }));

    // Cache the result
    bahanCache.set(cacheKey, transformedResults);

    return NextResponse.json(transformedResults);
  } catch (error) {
    console.error('Error searching bahan:', error);
    return NextResponse.json({ error: 'Failed to search bahan' }, { status: 500 });
  }
}
