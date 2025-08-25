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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  
  if (!startDate || !endDate) {
    return NextResponse.json(
      { error: 'startDate and endDate are required' },
      { status: 400 }
    );
  }

  let pool;
  try {
    pool = await sql.connect(config);
    
    const query = `
      SELECT [bookid], barcode, name as book_name, author, COUNT(*) as persons
      FROM (
        SELECT DISTINCT A.[bookid], B.barcode, B.name, B.author, C.[id], C.name as membername
        FROM [Library].[dbo].[OutIn] A 
        INNER JOIN [dbo].[Book] B ON A.bookid = B.id
        INNER JOIN [dbo].[ChurchMember] C ON A.id = C.id
        WHERE A.opendate BETWEEN @startDate AND @endDate
      ) Z
      GROUP BY [bookid], barcode, name, author
      ORDER BY COUNT(*) DESC, name
    `;
    
    const result = await pool.request()
      .input('startDate', sql.VarChar, startDate)
      .input('endDate', sql.VarChar, endDate)
      .query(query);
    
    // value 필드로 감싸지 않고 직접 배열 반환
    return NextResponse.json({
      success: true,
      data: result.recordset
    });
  } catch (error) {
    console.error('Error in loanstats/books API:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch book statistics',
        error: String(error)
      },
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
