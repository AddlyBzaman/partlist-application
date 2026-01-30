import { NextRequest, NextResponse } from 'next/server';
import { ListBahanService } from '@/lib/services/listBahanService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '500');
    const keyword = searchParams.get('keyword') || undefined;

    const result = await ListBahanService.getAll(page, limit, keyword);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching list bahan:', error);
    return NextResponse.json({ error: 'Failed to fetch list bahan' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const newItem = await ListBahanService.create(body);
    
    return NextResponse.json({ 
      success: true, 
      data: newItem 
    });
  } catch (error) {
    console.error('Error creating list bahan:', error);
    return NextResponse.json({ error: 'Failed to create list bahan' }, { status: 500 });
  }
}
