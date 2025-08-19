import { getConnection, closeConnection } from '../db';
import { Book, BookInput } from '../models/book';



export async function getAllBooks(): Promise<Book[]> {
  const pool = await getConnection();
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
            ,A.[status]
            ,(case when isnull((select count(*) from OutIn B where B.bookid = A.id and B.closedate is null), 0) > 0 then 0 else 1 end) as [available]
      FROM [book] A 
      LEFT JOIN [category] C ON LTRIM(RTRIM(A.category)) = LTRIM(RTRIM(C.code))
      LEFT JOIN [common] D ON D.grp = '1' AND LTRIM(RTRIM(A.[type])) = LTRIM(RTRIM(D.code))
    `);
    return result.recordset;
  } finally {
    await closeConnection();
  }
}

export async function getBookById(id: number): Promise<Book | null> {
  const pool = await getConnection();
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
              ,A.[status]
              ,(case when isnull((select count(*) from OutIn B where B.bookid = A.id and B.closedate is null), 0) > 0 then 0 else 1 end) as [available]
        FROM [book] A
        LEFT JOIN [category] C ON LTRIM(RTRIM(A.category)) = LTRIM(RTRIM(C.code))
        LEFT JOIN [common] D ON D.grp = '1' AND LTRIM(RTRIM(A.[type])) = LTRIM(RTRIM(D.code))
        WHERE id = @id
      `);
    
    if (result.recordset[0]) {
      console.log('Book data from DB:', result.recordset[0]);
    }
    
    return result.recordset[0] || null;
  } finally {
    await closeConnection();
  }
}

export async function createBook(book: BookInput): Promise<Book> {
  const pool = await getConnection();
  try {
    const result = await pool
      .request()
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
      .query(`
        INSERT INTO [Library].[dbo].[book] (
          barcode, name, num, author, fullname, category, type, oldcategory, authorcode,
          claimnum, copynum, isbn, publish, publishyear, attach, claim, status
        )
        OUTPUT INSERTED.*
        VALUES (
          @barcode, @name, @num, @author, @fullname, @category, @book_type, @oldcategory, @authorcode,
          @claimnum, @copynum, @isbn, @publish, @publishyear, @attach, @claim, 1
        )
      `);
    return result.recordset[0];
  } finally {
    await closeConnection();
  }
}

export async function updateBook(id: number, book: BookInput): Promise<Book | null> {
  const pool = await getConnection();
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