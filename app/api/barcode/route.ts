import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const isbn = searchParams.get('isbn');
  if (!isbn) {
    return NextResponse.json({ error: 'No ISBN' }, { status: 400 });
  }
  const apiUrl = `https://api.barcodelookup.com/v3/products?barcode=${isbn}&formatted=y&key=xs0fhlceammqbqznohovszkvmwtk3k`;
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    return NextResponse.json(data);
  } catch (_err) {
    return NextResponse.json({ error: 'API 호출 실패' }, { status: 500 });
  }
} 