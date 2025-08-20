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
      SELECT [id] as person_id, membername as person_name, COUNT(*) as books
      FROM (
        SELECT DISTINCT A.[bookid], B.barcode, B.name, C.[id], C.name as membername
        FROM [Library].[dbo].[OutIn] A 
        INNER JOIN [dbo].[Book] B ON A.bookid = B.id
        INNER JOIN [dbo].[vwPeople] C ON A.id = C.id
        WHERE A.opendate BETWEEN @startDate AND @endDate
      ) Z
      GROUP BY [id], membername
      ORDER BY COUNT(*) DESC, membername
    `;
    
    const result = await pool.request()
      .input('startDate', sql.VarChar, startDate)
      .input('endDate', sql.VarChar, endDate)
      .query(query);
    
    return NextResponse.json(result.recordset);
  } catch (error) {
    console.error('Error in loanstats/people API:', error);
    return NextResponse.json(
      { error: String(error), details: 'Failed to fetch people statistics' },
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
