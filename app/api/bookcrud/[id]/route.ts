import { NextRequest, NextResponse } from 'next/server';
import { getBookById, updateBook, deleteBook } from '@/lib/services/bookService';
import { BookInput } from '@/lib/models/book';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const bookId = parseInt(id);
    const book = await getBookById(bookId);
    
    if (!book) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(book);
  } catch (_error: any) {
    return NextResponse.json(
      { error: _error.message || 'Failed to fetch book' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const bookId = parseInt(id);
    const book: BookInput = await request.json();
    
    console.log('PUT /api/bookcrud/[id] - Received data:', {
      bookId,
      bookData: book,
      bookType: book.book_type,
      bookTypeType: typeof book.book_type
    });
    
    const updatedBook = await updateBook(bookId, book);
    
    console.log('PUT /api/bookcrud/[id] - Update result:', updatedBook);
    
    if (!updatedBook) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(updatedBook);
  } catch (_error: any) {
    console.error('PUT /api/bookcrud/[id] - Error:', _error);
    return NextResponse.json(
      { error: _error.message || 'Failed to update book' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const bookId = parseInt(id);
    const success = await deleteBook(bookId);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (_error: any) {
    return NextResponse.json(
      { error: _error.message || 'Failed to delete book' },
      { status: 500 }
    );
  }
} 