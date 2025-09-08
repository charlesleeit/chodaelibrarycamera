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
    console.log('Skipping test API during build phase');
    return NextResponse.json({
      message: 'Test API skipped during build phase',
      summary: [],
      sample_data: [],
      length_distribution: []
    });
  }

  let pool;
  try {
    pool = await sql.connect(config);
    
    // BOOK 테이블에서 author 필드 값들을 상세히 분석
    const queries = [
      // 1. 전체 책 수와 author 필드가 있는 책 수
      `SELECT 
        COUNT(*) as total_books,
        COUNT(CASE WHEN author IS NOT NULL AND author != '' THEN 1 END) as books_with_author,
        COUNT(CASE WHEN author IS NULL OR author = '' THEN 1 END) as books_without_author
       FROM [Library].[dbo].[Book]`,
      
      // 2. author 필드가 있는 책들의 샘플 데이터
      `SELECT TOP 10 id, barcode, name, author, LEN(author) as author_length
       FROM [Library].[dbo].[Book]
       WHERE author IS NOT NULL AND author != ''
       ORDER BY id DESC`,
      
      // 3. author 필드의 길이 분포
      `SELECT 
        CASE 
          WHEN LEN(author) <= 10 THEN '1-10자'
          WHEN LEN(author) <= 20 THEN '11-20자'
          WHEN LEN(author) <= 30 THEN '21-30자'
          WHEN LEN(author) <= 50 THEN '31-50자'
          ELSE '50자 이상'
        END as author_length_range,
        COUNT(*) as count
       FROM [Library].[dbo].[Book]
       WHERE author IS NOT NULL AND author != ''
       GROUP BY 
        CASE 
          WHEN LEN(author) <= 10 THEN '1-10자'
          WHEN LEN(author) <= 20 THEN '11-20자'
          WHEN LEN(author) <= 30 THEN '21-30자'
          WHEN LEN(author) <= 50 THEN '31-50자'
          ELSE '50자 이상'
        END
       ORDER BY author_length_range`
    ];
    
    const results = [];
    for (const query of queries) {
      const result = await pool.request().query(query);
      results.push(result.recordset);
    }
    
    return NextResponse.json({
      message: 'BOOK 테이블의 author 필드 분석 결과',
      summary: results[0],
      sample_data: results[1],
      length_distribution: results[2]
    });
  } catch (error) {
    console.error('Error in test API:', error);
    
    // During build time, return empty data instead of error
    if (process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build') {
      console.log('Database not available during build, returning empty test data');
      return NextResponse.json({
        message: 'Test API - Database not available during build',
        summary: [],
        sample_data: [],
        length_distribution: []
      });
    }
    
    return NextResponse.json(
      { error: String(error) },
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