import { NextRequest, NextResponse } from 'next/server';
import sql from 'mssql';

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER || '',
  database: process.env.DB_NAME,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : undefined,
  options: { encrypt: true, trustServerCertificate: true },
};

// GET: 특정 책 정보 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  
  let pool;
  try {
    pool = await sql.connect(config);
    
    const query = `
      SELECT id, barcode, name, author, category
      FROM [Book]
      WHERE id = @id
    `;
    
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(query);
    
    if (result.recordset.length === 0) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      book: result.recordset[0]
    });
  } catch (error) {
    console.error('Error fetching book:', error);
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

// PUT: 책 정보 업데이트 (카테고리 등)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  const body = await request.json();
  
  let pool;
  try {
    pool = await sql.connect(config);
    
    // 업데이트할 필드들을 동적으로 구성
    const updateFields: string[] = [];
    const inputs: any = {};
    
    if (body.category !== undefined) {
      updateFields.push('category = @category');
      inputs.category = body.category;
    }
    
    if (body.name !== undefined) {
      updateFields.push('name = @name');
      inputs.name = body.name;
    }
    
    if (body.author !== undefined) {
      updateFields.push('author = @author');
      inputs.author = body.author;
    }
    
    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }
    
    const query = `
      UPDATE [Book]
      SET ${updateFields.join(', ')}
      WHERE id = @id
    `;
    
    const request = pool.request().input('id', sql.Int, id);
    
    if (inputs.category !== undefined) {
      request.input('category', sql.NVarChar, inputs.category);
    }
    if (inputs.name !== undefined) {
      request.input('name', sql.NVarChar, inputs.name);
    }
    if (inputs.author !== undefined) {
      request.input('author', sql.NVarChar, inputs.author);
    }
    
    const result = await request.query(query);
    
    if (result.rowsAffected[0] === 0) {
      return NextResponse.json(
        { error: 'Book not found or no changes made' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Book updated successfully'
    });
  } catch (error) {
    console.error('Error updating book:', error);
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

// DELETE: 책 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  
  let pool;
  try {
    pool = await sql.connect(config);
    
    const query = `
      DELETE FROM [Book]
      WHERE id = @id
    `;
    
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(query);
    
    if (result.rowsAffected[0] === 0) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Book deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting book:', error);
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