import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const produkId = params.id;
    
    // Get produk details
    const [produkRows] = await db.query(
      'SELECT * FROM partlist_produk WHERE id = ?',
      [produkId]
    );
    
    // Get produk items
    const [itemRows] = await db.query(
      `SELECT 
        id,
        produk_id,
        item_no,
        code,
        nama_bahan,
        spesifikasi,
        keterangan,
        pakai_pc,
        unit,
        created_at
      FROM partlist_produk_items 
      WHERE produk_id = ? 
      ORDER BY item_no ASC`,
      [produkId]
    );
    
    return NextResponse.json({
      produk: (produkRows as any[])[0] || null,
      items: itemRows
    });
  } catch (error) {
    console.error('Error fetching part list produk detail:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
