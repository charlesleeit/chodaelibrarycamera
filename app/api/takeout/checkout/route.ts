import { NextResponse } from 'next/server';
import sql from 'mssql';

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

export async function POST(request: Request) {
  let insertSql = '';
  let id, bookId, book;
  let pool;
  try {
    ({ id, bookId } = await request.json());

    if (!id || !bookId) {
      return NextResponse.json({ success: false, message: '필수값 누락' }, { status: 400 });
    }
    pool = await sql.connect(config);

    // 1. 책 존재 확인
    const bookResult = await sql.query`
      SELECT A.[id], A.[barcode]
        FROM [book] A inner join [OutIn] B on A.id = B.bookid
       WHERE A.status = true AND B.closedate is null AND A.barcode = ${bookId}
    `;
    if (bookResult.recordset.length === 1) {
      return NextResponse.json({ success: false, message: '반납되지 않은 책입니다.' }, { status: 404 });
    }

    const bookResult2 = await sql.query`
    SELECT [id]
      FROM [book]
     WHERE barcode = ${bookId}
  `;
  
    book = bookResult2.recordset[0];

    insertSql = `
      INSERT INTO [OutIn] ([id], [bookid])
      VALUES (${id}, ${book.id})
    `;
    
    //console.log('sql : ', insertSql);

    await sql.query(insertSql);  

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error:', error);
    console.error('insertSql:', insertSql);
    console.error('id:', typeof id !== 'undefined' ? id : 'id is undefined');
    console.error('bookId:', typeof bookId !== 'undefined' ? bookId : 'bookId is undefined');
    console.error('book:', typeof book !== 'undefined' ? book : 'book is undefined');
    return NextResponse.json({ success: false, message: String(insertSql)}, { status: 500 });
  } finally {
    if (pool) try { await pool.close(); } catch {}
  }
} 