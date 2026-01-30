import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id;
    
    // Delete product from partlist table
    const [result] = await db.query(
      'DELETE FROM partlist WHERE id = ?',
      [productId]
    );
    
    return NextResponse.json({ 
      success: true,
      message: 'Produk berhasil dihapus' 
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
