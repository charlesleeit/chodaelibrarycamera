import { NextRequest, NextResponse } from 'next/server';
import sql from 'mssql';

export const dynamic = 'force-dynamic';

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER || '',
  database: process.env.DB_NAME,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : undefined,
  options: { encrypt: true, trustServerCertificate: true },
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const barcode = searchParams.get('barcode');
  
  if (!barcode) {
    return NextResponse.json(
      { error: 'Barcode is required' },
      { status: 400 }
    );
  }
  
  let pool;
  try {
    pool = await sql.connect(config);
    
    const query = `
      SELECT id, barcode, name, author, category
      FROM [Book]
      WHERE barcode = @barcode
    `;
    
    const result = await pool.request()
      .input('barcode', sql.NVarChar, barcode)
      .query(query);
    
    if (result.recordset.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Book not found'
      });
    }
    
    return NextResponse.json({
      success: true,
      book: result.recordset[0]
    });
  } catch (error) {
    console.error('Error scanning book:', error);
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