import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { VercelRealtimeService } from '@/lib/realtime/vercel-realtime';

// Node.js runtime for database operations (Edge doesn't support mysql2)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { noprod, produk_name, satuan, bahan_items, user_id } = body;

    // Validate required fields
    if (!noprod || !produk_name || !satuan || !bahan_items || bahan_items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Start transaction
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();

      // Insert main produk record
      const [produkResult] = await connection.execute(
        'INSERT INTO partlist_produk (noprod, produk_name, satuan, user_id) VALUES (?, ?, ?, ?)',
        [noprod, produk_name, satuan, user_id]
      );
      
      const produkId = (produkResult as any).insertId;

      // Insert bahan items
      for (const item of bahan_items) {
        await connection.execute(
          `INSERT INTO partlist_produk_items 
           (produk_id, item_no, code, nama_bahan, spesifikasi, keterangan, pakai_pc, unit) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            produkId,
            item.no,
            item.code || '',
            item.nama_bahan || '',
            item.spesifikasi || '',
            item.keterangan || '',
            item.pakai_pc || '',
            item.unit || ''
          ]
        );
      }

      await connection.commit();
      
      const savedData = {
        produkId,
        noprod,
        produk_name,
        satuan,
        user_id,
        items_count: bahan_items.length,
        created_at: new Date().toISOString()
      };

      // Send real-time notification
      const realtimeService = VercelRealtimeService.getInstance();
      realtimeService.broadcast('PART_LIST_SAVED', {
        produkId: produkId,
        noprod,
        produk_name,
        satuan,
        user_id,
        items_count: bahan_items.length,
        timestamp: new Date().toISOString()
      });
      
      console.log('Part List Produk saved successfully:', savedData);

      return NextResponse.json(
        { 
          message: 'Part List Produk berhasil disimpan',
          data: {
            produkId,
            noprod,
            produk_name,
            satuan,
            user_id,
            items_count: bahan_items.length,
            created_at: new Date().toISOString()
          }
        },
        { status: 200 }
      );

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Error saving part list produk:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
