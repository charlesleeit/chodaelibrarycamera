import { getConnection, closeConnection } from '../db';
import { Book, BookInput } from '../models/book';



export async function getAllBooks(): Promise<Book[]> {
  const pool = await getConnection();
  
  // Skip database query during build time
  if (!pool) {
    console.log('Skipping getAllBooks during build phase');
    return [];
  }
  
  try {
    const result = await pool.request().query(`
      SELECT [id]
            ,[barcode]
            ,[name]
            ,[num]
            ,[author]
            ,[fullname]
            ,LTRIM(RTRIM(CAST(A.[category] as VARCHAR(10)))) as [category]
            ,C.description as [category_description]
            ,LTRIM(RTRIM(CAST(A.[type] as VARCHAR(10)))) as [book_type]
            ,D.description as [book_type_description]
            ,[oldcategory]
            ,[authorcode]
            ,[claimnum]
            ,[copynum]
            ,[isbn]
            ,[publish]
            ,[publishyear]
            ,[attach]
            ,[claim]
            ,[registerdate]
            ,[moddate]
            ,A.[status] as [raw_status]
            ,CASE 
              WHEN A.[status] IS NULL THEN 1
              WHEN A.[status] = 0 THEN 0
              WHEN A.[status] = 1 THEN 1
              WHEN A.[status] = 'true' OR A.[status] = 1 THEN 1
              WHEN A.[status] = 'false' OR A.[status] = 0 THEN 0
              WHEN A.[status] = '' THEN 1
              ELSE 1
            END as [status]
            ,(case when isnull((select count(*) from OutIn B where B.bookid = A.id and B.closedate is null), 0) > 0 then 0 else 1 end) as [available]
      FROM [book] A 
      LEFT JOIN [category] C ON LTRIM(RTRIM(A.category)) = LTRIM(RTRIM(C.code))
      LEFT JOIN [common] D ON D.grp = '1' AND LTRIM(RTRIM(A.[type])) = LTRIM(RTRIM(D.code))
    `);
    
    // 디버깅을 위해 첫 번째 책의 status 값 로그
    if (result.recordset.length > 0) {
      const firstBook = result.recordset[0];
      console.log('=== FIRST BOOK STATUS DEBUG ===');
      console.log('Raw status from DB:', firstBook.raw_status, 'type:', typeof firstBook.raw_status);
      console.log('Processed status:', firstBook.status, 'type:', typeof firstBook.status);
      console.log('Status comparison:', {
        raw: firstBook.raw_status,
        processed: firstBook.status,
        rawType: typeof firstBook.raw_status,
        processedType: typeof firstBook.status,
        isEqual: firstBook.raw_status === firstBook.status
      });
    }
    
    return result.recordset;
  } finally {
    await closeConnection();
  }
}

export async function getBookById(id: number): Promise<Book | null> {
  const pool = await getConnection();
  
  // Skip database query during build time
  if (!pool) {
    console.log('Skipping getBookById during build phase');
    return null;
  }
  
  try {
    const result = await pool
      .request()
      .input('id', id)
      .query(`
        SELECT [id]
              ,[barcode]
              ,[name]
              ,[num]
              ,[author]
              ,[fullname]
              ,LTRIM(RTRIM(CAST(A.[category] as VARCHAR(10)))) as [category]
              ,C.description as [category_description]
              ,LTRIM(RTRIM(CAST(A.[type] as VARCHAR(10)))) as [book_type]
              ,D.description as [book_type_description]
              ,[oldcategory]
              ,[authorcode]
              ,[claimnum]
              ,[copynum]
              ,[isbn]
              ,[publish]
              ,[publishyear]
              ,[attach]
              ,[claim]
              ,[registerdate]
              ,[moddate]
              ,A.[status] as [raw_status]
              ,CASE 
                WHEN A.[status] IS NULL THEN 1
                WHEN A.[status] = 0 THEN 0
                WHEN A.[status] = 1 THEN 1
                WHEN A.[status] = 'true' OR A.[status] = 1 THEN 1
                WHEN A.[status] = 'false' OR A.[status] = 0 THEN 0
                WHEN A.[status] = '' THEN 1
                ELSE 1
              END as [status]
              ,(case when isnull((select count(*) from OutIn B where B.bookid = A.id and B.closedate is null), 0) > 0 then 0 else 1 end) as [available]
        FROM [book] A
        LEFT JOIN [category] C ON LTRIM(RTRIM(A.category)) = LTRIM(RTRIM(C.code))
        LEFT JOIN [common] D ON D.grp = '1' AND LTRIM(RTRIM(A.[type])) = LTRIM(RTRIM(D.code))
        WHERE id = @id
      `);
    
    if (result.recordset[0]) {
      const book = result.recordset[0];
      console.log('=== BOOK BY ID STATUS DEBUG ===');
      console.log('Raw status from DB:', book.raw_status, 'type:', typeof book.raw_status);
      console.log('Processed status:', book.status, 'type:', typeof book.status);
      console.log('Status comparison:', {
        raw: book.raw_status,
        processed: book.status,
        rawType: typeof book.raw_status,
        processedType: typeof book.status,
        isEqual: book.raw_status === book.status
      });
    }
    
    return result.recordset[0] || null;
  } finally {
    await closeConnection();
  }
}

export async function createBook(book: BookInput): Promise<Book> {
  const pool = await getConnection();
  
  // Skip database query during build time
  if (!pool) {
    console.log('Skipping createBook during build phase');
    throw new Error('Database not available during build');
  }
  
  try {
    const sanitized = {
      barcode: book.barcode ?? '',
      name: book.name ?? '',
      num: book.num ?? '',
      author: book.author ?? '',
      fullname: book.fullname ?? '',
      category: (book.category ?? '').toString().trim(),
      book_type: (book.book_type ?? '').toString().trim(),
      oldcategory: book.oldcategory ?? '',
      authorcode: book.authorcode ?? '',
      claimnum: book.claimnum ?? '',
      copynum: book.copynum ?? '',
      isbn: book.isbn ?? '',
      publish: book.publish ?? '',
      publishyear: book.publishyear ?? '',
      attach: book.attach ?? '',
      claim: book.claim ?? '',
      status: book.status ?? 1
    };

    const result = await pool
      .request()
      .input('barcode', sanitized.barcode)
      .input('name', sanitized.name)
      .input('num', sanitized.num)
      .input('author', sanitized.author)
      .input('fullname', sanitized.fullname)
      .input('category', sanitized.category)
      .input('book_type', sanitized.book_type)
      .input('oldcategory', sanitized.oldcategory)
      .input('authorcode', sanitized.authorcode)
      .input('claimnum', sanitized.claimnum)
      .input('copynum', sanitized.copynum)
      .input('isbn', sanitized.isbn)
      .input('publish', sanitized.publish)
      .input('publishyear', sanitized.publishyear)
      .input('attach', sanitized.attach)
      .input('claim', sanitized.claim)
      .input('status', sanitized.status)
      .query(`
        INSERT INTO [Library].[dbo].[book] (
          barcode, name, num, author, fullname, category, type, oldcategory, authorcode,
          claimnum, copynum, isbn, publish, publishyear, attach, claim, status
        )
        OUTPUT INSERTED.*
        VALUES (
          @barcode, @name, @num, @author, @fullname, @category, @book_type, @oldcategory, @authorcode,
          @claimnum, @copynum, @isbn, @publish, @publishyear, @attach, @claim, @status
        )
      `);
    return result.recordset[0];
  } catch (err) {
    console.error('createBook failed:', err, { incoming: book });
    throw err;
  } finally {
    await closeConnection();
  }
}

export async function updateBook(id: number, book: BookInput): Promise<Book | null> {
  const pool = await getConnection();
  
  // Skip database query during build time
  if (!pool) {
    console.log('Skipping updateBook during build phase');
    throw new Error('Database not available during build');
  }
  
  try {
    console.log('bookService.updateBook - Input data:', {
      id,
      book,
      category: book.category,
      categoryType: typeof book.category,
      bookType: book.book_type,
      bookTypeType: typeof book.book_type
    });
    
    const result = await pool
      .request()
      .input('id', id)
      .input('barcode', book.barcode)
      .input('name', book.name)
      .input('num', book.num)
      .input('author', book.author)
      .input('fullname', book.fullname)
      .input('category', book.category)
      .input('book_type', book.book_type)
      .input('oldcategory', book.oldcategory)
      .input('authorcode', book.authorcode)
      .input('claimnum', book.claimnum)
      .input('copynum', book.copynum)
      .input('isbn', book.isbn)
      .input('publish', book.publish)
      .input('publishyear', book.publishyear)
      .input('attach', book.attach)
      .input('claim', book.claim)
      .input('status', book.status)
      .query(`
        UPDATE [Library].[dbo].[book]
        SET barcode = @barcode,
            name = @name,
            num = @num,
            author = @author,
            fullname = @fullname,
            category = @category,
            [type] = @book_type,
            oldcategory = @oldcategory,
            authorcode = @authorcode,
            claimnum = @claimnum,
            copynum = @copynum,
            isbn = @isbn,
            publish = @publish,
            publishyear = @publishyear,
            attach = @attach,
            claim = @claim,
            status = @status,
            moddate = getdate()
        OUTPUT INSERTED.*
        WHERE id = @id
      `);
    
    console.log('bookService.updateBook - SQL result:', result.recordset[0]);
    console.log('bookService.updateBook - Updated book type field:', result.recordset[0]?.type);
    
    return result.recordset[0] || null;
  } finally {
    await closeConnection();
  }
}

export async function deleteBook(id: number): Promise<boolean> {
  const pool = await getConnection();
  
  // Skip database query during build time
  if (!pool) {
    console.log('Skipping deleteBook during build phase');
    throw new Error('Database not available during build');
  }
  
  try {
    const result = await pool
      .request()
      .input('id', id)
      .query(`
        UPDATE [Library].[dbo].[book]
        SET status = 0,
            moddate = GETDATE()
        WHERE id = @id
      `);
    return result.rowsAffected[0] > 0;
  } finally {
    await closeConnection();
  }
} 