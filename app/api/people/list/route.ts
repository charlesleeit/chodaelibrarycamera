import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function GET() {
  try {
    const pool = await getConnection();
    
    // Skip database query during build time
    if (!pool) {
      console.log('Skipping people list API during build phase');
      return NextResponse.json([]);
    }
    
    const result = await pool.request().query('SELECT id, name, mobilenum FROM ChurchMember WHERE deleted = 0');
    return NextResponse.json(result.recordset);
  } catch (_error) {
    return NextResponse.json({ error: 'Failed to fetch people' }, { status: 500 });
  }
} 