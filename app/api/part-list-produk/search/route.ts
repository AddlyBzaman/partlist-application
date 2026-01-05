import { NextRequest, NextResponse } from 'next/server';
import { bahanService } from '@/lib/services/bahanService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('keyword');

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

