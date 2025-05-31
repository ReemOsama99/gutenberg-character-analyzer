import { NextRequest, NextResponse } from 'next/server';
import { fetchBook } from '@/app/lib/fetchBook';
import { analyzeText } from '@/app/lib/analyzeText';

export async function GET(req: NextRequest) {
  // Extract bookId from query parameter
  const { searchParams } = new URL(req.url);
  const bookId = searchParams.get('bookId');

  if (!bookId) {
    return NextResponse.json(
      { success: false, error: 'Missing bookId parameter.' },
      { status: 400 }
    );
  }

  try {
    const { text, metadata } = await fetchBook(bookId);
    const analysisResult = await analyzeText(text, metadata);
    console.log("Analysis completed successfully");

    return NextResponse.json({
      success: true,
      metadata,
      analysisResult
    });
  } catch (error) {
    console.error('Error in analyze-book API:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
