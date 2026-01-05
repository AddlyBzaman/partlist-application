import { NextRequest, NextResponse } from 'next/server';
import { bahanService } from '@/lib/services/bahanService';

// Node.js runtime for database operations
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Get keyword from headers instead of URL to avoid dynamic server usage
    const keyword = request.headers.get('x-keyword');

    if (!keyword || keyword.length < 2) {
      return NextResponse.json([], { status: 200 });
    }

    const results = await bahanService.search(keyword);

    const transformedResults = results.map(item => ({
      id: item.id,
      kode_lama: item.CODE,
      kode_baru: item.CODE_BARU,
      nama_bahan: item.LNAMA || item.namabahan || '',
      spesifikasi: item.SPEK || '',
      unit: item.UNIT || '',
    }));

    return NextResponse.json(transformedResults);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

