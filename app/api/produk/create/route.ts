import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { namaproduk, rated, produk1, produk2, produk3, stokproduk, user_id } = await request.json();

    if (!namaproduk) {
      return NextResponse.json({ error: 'Nama produk wajib diisi' }, { status: 400 });
    }

    // Insert ke tabel partlist dengan kolom yang sesuai
    const [result] = await db.query(
      `INSERT INTO partlist (
        nama_produk, rated, produk1, produk2, produk3, no_part, user_id, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        namaproduk,
        rated || null,
        produk1 || null,
        produk2 || null,
        produk3 || null,
        stokproduk || null,
        user_id || 'Unknown'
      ]
    );

    return NextResponse.json({ 
      success: true, 
      message: 'Produk berhasil disimpan',
      id: (result as any).insertId 
    });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Failed to save product' }, { status: 500 });
  }
}
