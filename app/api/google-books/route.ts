import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isbn = searchParams.get('isbn');
    
    if (!isbn) {
      return NextResponse.json({ error: 'ISBN is required' }, { status: 400 });
    }

    // Google Books API 호출
    const googleBooksUrl = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`;
    
    const response = await fetch(googleBooksUrl);
    
    if (!response.ok) {
      throw new Error(`Google Books API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'No book found with this ISBN' 
      });
    }
    
    const book = data.items[0].volumeInfo;
    
    // Google Books API 응답을 우리 시스템에 맞게 변환
    const transformedBook = {
      title: book.title || 'Unknown Title',
      authors: book.authors || ['Unknown Author'],
      publisher: book.publisher || 'Unknown Publisher',
      publishedDate: book.publishedDate || 'Unknown Date',
      description: book.description || 'No description available',
      isbn: isbn,
      pageCount: book.pageCount || 0,
      categories: book.categories || [],
      language: book.language || 'Unknown',
      imageLinks: book.imageLinks || {},
      previewLink: book.previewLink || '',
      infoLink: book.infoLink || '',
      canonicalVolumeLink: book.canonicalVolumeLink || '',
      averageRating: book.averageRating || 0,
      ratingsCount: book.ratingsCount || 0,
      maturityRating: book.maturityRating || 'NOT_MATURE'
    };
    
    return NextResponse.json({ 
      success: true, 
      book: transformedBook 
    });
    
  } catch (error) {
    console.error('Google Books API error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch book information from Google Books API' 
    }, { status: 500 });
  }
}
