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
  let updateSql = '';
  let bookId;
  let pool;
  try {
    ({ bookId } = await request.json());

    if (!bookId) {
      return NextResponse.json({ success: false, message: '필수값 누락' }, { status: 400 });
    }
    pool = await sql.connect(config);

    // OutIn 테이블에서 closedate=null이고 해당 바코드인 row 찾기
    const outinResult = await sql.query`
      select top 1 B.[id]
        from OutIn A inner join Book B on A.bookid = B.id
       where B.barcode = ${bookId} 
         and A.closedate is null
         `;

    if (outinResult.recordset.length === 0) {
      return NextResponse.json({ success: false, message: 'return할 book이 없습니다.' }, { status: 404 });
    }
    const { id } = outinResult.recordset[0];

    // closedate 업데이트
    updateSql = `update OutIn set closedate = getdate() where bookid = @id and closedate is null `;

    await new sql.Request()
      .input('id', id)
      .query(updateSql);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, message: String(error) }, { status: 500 });
  } finally {
    if (pool) try { await pool.close(); } catch {}
  }
} 