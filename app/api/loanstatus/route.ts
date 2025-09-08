import { NextResponse } from 'next/server';
import { getAllLoanStatus } from '@/lib/services/loanService';

export async function GET() {
  try {
    const loans = await getAllLoanStatus();
    return NextResponse.json(loans);
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to fetch loan status' },
      { status: 500 }
    );
  }
} 