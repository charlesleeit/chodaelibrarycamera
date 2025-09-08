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
    console.log('Skipping booktype API during build phase');
    return NextResponse.json([]);
  }

  let pool;
  try {
    pool = await sql.connect(config);
    
    // grp = '1' 조건으로 book type 데이터 조회
    const result = await pool.request().query(`
      SELECT [code], [description]
      FROM [Library].[dbo].[Common]
      WHERE [grp] = '1'
      ORDER BY [code]
    `);
    
    console.log('Book types from grp = 1:', result.recordset);
    
    // 각 항목의 상세 정보 로깅
    result.recordset.forEach((item, index) => {
      console.log(`Item ${index}: code="${item.code}", description="${item.description}", code type: ${typeof item.code}`);
    });
    
    return NextResponse.json(result.recordset);
  } catch (error) {
    console.error('Error in booktype API:', error);
    
    // During build time, return empty array instead of error
    if (process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build') {
      console.log('Database not available during build, returning empty book types');
      return NextResponse.json([]);
    }
    
    return NextResponse.json(
      { error: String(error), details: 'Failed to fetch book types' },
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
