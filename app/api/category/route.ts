import { NextResponse } from 'next/server';
import sql from 'mssql';

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER || '',
  database: process.env.DB_NAME,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : undefined,
  options: { encrypt: true, trustServerCertificate: true },
};

export async function GET() {
  // Skip database connection during build time
  if (process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build') {
    console.log('Skipping category API during build phase');
    return NextResponse.json([]);
  }

  let pool;
  try {
    pool = await sql.connect(config);
    
    const result = await pool.request().query(`
      SELECT LTRIM(RTRIM(CAST([code] as VARCHAR(10)))) as code, [description]
      FROM [Library].[dbo].[Category]
      WHERE [status] = 1
      ORDER BY [code]
    `);
    
    // 중복 체크
    const codes = new Set();
    const duplicates = result.recordset.filter(cat => {
      if (codes.has(cat.code)) {
        return true;
      }
      codes.add(cat.code);
      return false;
    });
    
    if (duplicates.length > 0) {
      console.warn('Duplicate category codes found:', duplicates);
    }
    
    return NextResponse.json(result.recordset);
  } catch (error) {
    console.error('Error in category API:', error);
    
    // During build time, return empty array instead of error
    if (process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build') {
      console.log('Database not available during build, returning empty categories');
      return NextResponse.json([]);
    }
    
    return NextResponse.json(
      { error: String(error), details: 'Failed to fetch categories' },
      { status: 500 }
    );
  } finally {
    if (pool) {
      try {
        await pool.close();
      } catch (error) {
        console.error('Error closing SQL connection:', error);
      }
    }
  }
} 