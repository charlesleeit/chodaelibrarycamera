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
    const barcode = searchParams.get('barcode');
    const bookid = searchParams.get('bookid');
    if (!barcode && !bookid) {
      return NextResponse.json({ success: false, message: 'barcode or bookid required' }, { status: 400 });
    }
    pool = await sql.connect(config);
    let result;
    if (barcode) {
      result = await sql.query`
        SELECT [id], [barcode], [name], [num]
        FROM [book]
        WHERE status = true AND barcode = ${barcode}
      `;
    } 
    if (!result || !result.recordset || result.recordset.length === 0) {
      return NextResponse.json({ success: false, message: 'Book not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, book: result.recordset[0] });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  } finally {
    if (pool) try { await pool.close(); } catch {}
  }
} 