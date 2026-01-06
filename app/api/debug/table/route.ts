import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const [rows] = await db.query('DESCRIBE partlist');
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error describing table:', error);
    return NextResponse.json({ error: 'Failed to describe table' }, { status: 500 });
  }
}
