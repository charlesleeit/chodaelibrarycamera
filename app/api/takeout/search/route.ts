import { NextResponse } from 'next/server';
import sql from 'mssql';

export const dynamic = 'force-dynamic';

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER || '',
  database: process.env.DB_NAME,  
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : undefined,
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

export async function GET(request: Request) {
  let pool;
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ 
        success: false, 
        message: 'ID is required' 
      }, { status: 400 });
    }

    // Connect to the database
    pool = await sql.connect(config);

    // Query the OutIn table
    const result = await sql.query`
      SELECT A.[id]
            ,CONVERT(VARCHAR(10), A.[date], 101) as [date]
            ,A.[line]
            ,A.[bookid]
            ,B.[barcode]
            ,iif(A.[closedate] is not null, CONVERT(VARCHAR(10), A.[closedate], 101), '') as closedate
            , B.[name] + ' ' + B.[num] as bookname
      FROM [Library].[dbo].[OutIn] A 
      LEFT OUTER JOIN book B ON A.[bookid] = B.id
      WHERE A.[id] = ${id}
      ORDER BY A.[date] DESC, A.[line] DESC
    `;

    return NextResponse.json({ 
      success: true, 
      records: result.recordset 
    });

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'An error occurred while searching' 
    }, { status: 500 });
  } finally {
    if (pool) await pool.close();
  }
} 