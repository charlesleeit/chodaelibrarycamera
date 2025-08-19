import { NextResponse } from 'next/server';
import { getConnection, closeConnection } from '@/lib/db';

export async function GET() {
  try {
    const pool = await getConnection();
    const result = await pool.request().query('SELECT 1 as test');
    await closeConnection();
    
    return NextResponse.json({ success: true, data: result.recordset });
  } catch (_error) {
    return NextResponse.json(
      { success: false, error: 'Database connection failed' },
      { status: 500 }
    );
  }
} 