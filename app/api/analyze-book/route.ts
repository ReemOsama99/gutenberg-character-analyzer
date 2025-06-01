import { NextRequest, NextResponse } from 'next/server';
import { fetchBookText } from '@/app/services/textService';
import { fetchMetadata } from '@/app/services/metadataService';
import { analyzeText } from '@/app/services/textAnalysisService';
import { BookMetadata, AnalysisResult } from '@/app/common/types'; // Assuming types are in common/types

// Define a type for our cache entry
interface CacheEntry {
  metadata: BookMetadata;
  analysisResult: AnalysisResult;
  timestamp: number; // Optional: for TTL or LRU logic later
}

// Initialize an in-memory cache
const analysisCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 1000 * 60 * 60; // Optional: Cache for 1 hour

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

  // Check cache first
  const cachedEntry = analysisCache.get(bookId);
  if (cachedEntry) {
    // Check if cache entry has expired
    if (Date.now() - cachedEntry.timestamp < CACHE_TTL_MS) {
      console.log(`Returning cached data for bookId: ${bookId}`);
      return NextResponse.json({
        success: true,
        metadata: cachedEntry.metadata,
        analysisResult: cachedEntry.analysisResult,
        source: 'cache'
      });
    } else {
      // Cache expired, remove it
      analysisCache.delete(bookId);
    }
  }

  try {
    console.log(`Fetching and analyzing data for bookId: ${bookId} (not found in cache or expired)`);
    // Fetch text and metadata in parallel
    const [text, metadata] = await Promise.all([
      fetchBookText(bookId),
      fetchMetadata(bookId)
    ]);

    const analysisResult = await analyzeText(text, metadata);

    // Store in cache upon successful analysis
    analysisCache.set(bookId, {
      metadata,
      analysisResult,
      timestamp: Date.now()
    });
    console.log(`Data for bookId: ${bookId} stored in cache.`);

    return NextResponse.json({
      success: true,
      metadata,
      analysisResult,
      source: 'api'
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during analysis.';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
