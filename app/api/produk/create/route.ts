import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Received data:', body);

    const {
      no_produk,
      nama_produk,
      rated,
      produk1,
      produk2,
      produk3,
      stokproduk,
      user_id
    } = body;

    if (!no_produk) {
      return NextResponse.json({ error: 'No produk wajib diisi' }, { status: 400 });
    }

    if (!nama_produk) {
      return NextResponse.json({ error: 'Nama produk wajib diisi' }, { status: 400 });
    }

    const [result] = await db.query(
      `INSERT INTO partlist (
        NOPROD, PRODUK, RATED, PRODUK1, PRODUK2, PRODUK3, NO_PART, USER_ID, LAST_UPDATE
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        no_produk,
        nama_produk,
        rated || null,
        produk1 || null,
        produk2 || null,
        produk3 || null,
        stokproduk || null,
        user_id || 'Unknown'
      ]
    );

    return NextResponse.json({
      message: 'Produk berhasil disimpan',
      data: result
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Gagal menyimpan produk' },
      { status: 500 }
    );
  }
}
