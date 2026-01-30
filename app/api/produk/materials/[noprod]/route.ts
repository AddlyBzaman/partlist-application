import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { noprod: string } }
) {
  try {
    const noprod = params.noprod;
    
    // First get the product name from partlist table using NOPROD
    const [productRows] = await db.query(
      'SELECT PRODUK FROM partlist WHERE NOPROD = ?',
      [noprod]
    ) as any[];
    
    if (productRows.length === 0) {
      return NextResponse.json([]);
    }
    
    const productName = productRows[0].PRODUK;
    
    // Get materials from partlist_a that are related to this product name
    const [rows] = await db.query(`
      SELECT
        id,
        CODE AS code,
        CODE_BARU AS code_baru,
        LNAMA AS nama_bahan,
        SPEK AS spesifikasi,
        UNIT AS unit,
        PROSES,
        BDOWN,
        RUMUS,
        Produk,
        pakaiperpcs,
        namawip,
        departemen
      FROM partlist_a 
      WHERE Produk = ?
      ORDER BY CODE ASC, LNAMA ASC
    `, [productName]);
    
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching materials for product:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
