import axios from 'axios';
import * as cheerio from 'cheerio';
import { BookMetadata } from '../common/types';

export async function fetchBook(bookId: string): Promise<{
  text: string;
  metadata: BookMetadata;
}> {
  try {
    const textUrl = `https://www.gutenberg.org/cache/epub/${bookId}/pg${bookId}.txt`;
    const metaUrl = `https://www.gutenberg.org/ebooks/${bookId}`;

    const [textRes, metaRes] = await Promise.all([
      axios.get(textUrl),
      axios.get(metaUrl),
    ]);

    const text = textRes.data;
    const $ = cheerio.load(metaRes.data);

    // Correct selector for title - using the book_title ID
    const title = $('#book_title').text().trim() ||
      $('meta[name="title"]').attr('content') ||
      $('h1').first().text().trim();

    // Better author extraction
    const author = $('a[rel="marcrel:aut"]').text().trim() ||
      $('tr:has(th:contains("Author")) td').text().trim();

    // More reliable selectors for metadata from the bibrec table
    const language = $('tr[property="dcterms:language"] td').text().trim();
    const releaseDate = $('tr:has(th:contains("Release Date")) td').text().trim();

    // Get subjects from the correct table rows
    const subjects = $('tr:has(th:contains("Subject")) td a')
      .map((_, el) => $(el).text().trim())
      .get();

    return {
      text,
      metadata: {
        title,
        author,
        language,
        releaseDate,
        subjects,
      },
    };
  } catch (error) {
    console.error('Error fetching book:', error);
    throw new Error(`Failed to fetch book with ID ${bookId}`);
  }
}