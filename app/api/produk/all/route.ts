import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get('search') || '';
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 0; // 0 = no limit
    const offset = (page - 1) * limit;

    const whereClause = search ? 'WHERE PRODUK LIKE ?' : '';
    
    // Jika limit = 0, tidak pakai LIMIT/OFFSET
    let query = `SELECT * FROM partlist ${whereClause} ORDER BY PRODUK ASC`;
    let params: any[] = search ? [`%${search}%`] : [];
    
    if (limit > 0) {
      query += ' LIMIT ? OFFSET ?';
      params = search ? [`%${search}%`, limit, offset] : [limit, offset];
    }

    // 🔹 Ambil data produk
    const [rows] = await db.query(query, params) as any;

    // 🔹 Hitung total data
    const [countResult] = await db.query(
      `SELECT COUNT(*) AS total FROM partlist ${whereClause}`,
      search ? [`%${search}%`] : []
    ) as any[];

    return NextResponse.json({
      success: true,
      search,
      page,
      limit,
      total: countResult[0]?.total || 0,
      totalPages: limit > 0 ? Math.ceil(countResult[0]?.total / limit) : 1,
      data: rows
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
