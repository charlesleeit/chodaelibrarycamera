import { NextResponse } from 'next/server';
import { getAllBooks, createBook } from '@/lib/services/bookService';
import { BookInput } from '@/lib/models/book';

export async function GET() {
  try {
    const books = await getAllBooks();
    return NextResponse.json(books);
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to fetch books' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const book: BookInput = await request.json();
    const newBook = await createBook(book);
    return NextResponse.json(newBook, { status: 201 });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to create book' },
      { status: 500 }
    );
  }
} 