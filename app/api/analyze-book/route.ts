import { NextRequest, NextResponse } from 'next/server';
import { fetchBookText } from '@/app/services/textService';
import { fetchMetadata } from '@/app/services/metadataService';
import { analyzeText } from '@/app/services/textAnalysisService';

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
    // Fetch text and metadata in parallel
    const [text, metadata] = await Promise.all([
      fetchBookText(bookId),
      fetchMetadata(bookId)
    ]);

    const analysisResult = await analyzeText(text, metadata);

    return NextResponse.json({
      success: true,
      metadata,
      analysisResult
    });
  } catch (error) {
    // Ensure error is an instance of Error for consistent message handling
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during analysis.';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
