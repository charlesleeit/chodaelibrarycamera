import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function GET() {
  try {
    const pool = await getConnection();
    const result = await pool.request().query('SELECT id, name, mobilenum FROM vwPeople WHERE deleted = 0');
    return NextResponse.json(result.recordset);
  } catch (_error) {
    return NextResponse.json({ error: 'Failed to fetch people' }, { status: 500 });
  }
} 