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
  
  console.log('=== PUT API UPDATE START ===');
  console.log('Book ID:', id);
  console.log('Request body:', body);
  console.log('Status value:', body.status, 'type:', typeof body.status);
  
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
    
    if (body.status !== undefined) {
      updateFields.push('status = @status');
      inputs.status = body.status;
    }
    
    if (body.barcode !== undefined) {
      updateFields.push('barcode = @barcode');
      inputs.barcode = body.barcode;
    }
    
    if (body.book_type !== undefined) {
      updateFields.push('[type] = @book_type');
      inputs.book_type = body.book_type;
    }
    
    if (body.oldcategory !== undefined) {
      updateFields.push('oldcategory = @oldcategory');
      inputs.oldcategory = body.oldcategory;
    }
    
    if (body.authorcode !== undefined) {
      updateFields.push('authorcode = @authorcode');
      inputs.authorcode = body.authorcode;
    }
    
    if (body.isbn !== undefined) {
      updateFields.push('isbn = @isbn');
      inputs.isbn = body.isbn;
    }
    
    if (body.publish !== undefined) {
      updateFields.push('publish = @publish');
      inputs.publish = body.publish;
    }
    
    if (body.publishyear !== undefined) {
      updateFields.push('publishyear = @publishyear');
      inputs.publishyear = body.publishyear;
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
    if (inputs.status !== undefined) {
      request.input('status', sql.Int, inputs.status);
    }
    if (inputs.barcode !== undefined) {
      request.input('barcode', sql.NVarChar, inputs.barcode);
    }
    if (inputs.book_type !== undefined) {
      request.input('book_type', sql.NVarChar, inputs.book_type);
    }
    if (inputs.oldcategory !== undefined) {
      request.input('oldcategory', sql.NVarChar, inputs.oldcategory);
    }
    if (inputs.authorcode !== undefined) {
      request.input('authorcode', sql.NVarChar, inputs.authorcode);
    }
    if (inputs.isbn !== undefined) {
      request.input('isbn', sql.NVarChar, inputs.isbn);
    }
    if (inputs.publish !== undefined) {
      request.input('publish', sql.NVarChar, inputs.publish);
    }
    if (inputs.publishyear !== undefined) {
      request.input('publishyear', sql.NVarChar, inputs.publishyear);
    }
    
    const result = await request.query(query);
    
    console.log('SQL Query executed:', query);
    console.log('Input parameters:', inputs);
    console.log('Rows affected:', result.rowsAffected[0]);
    
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