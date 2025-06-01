import axios from 'axios';
import * as cheerio from 'cheerio';
import { BookMetadata } from '../common/types';

export async function fetchMetadata(bookId: string): Promise<BookMetadata> {
    try {
        const metaUrl = `https://www.gutenberg.org/ebooks/${bookId}`;
        const metaRes = await axios.get(metaUrl);
        const $ = cheerio.load(metaRes.data);
        return extractMetaData($);
    } catch (error) {
        console.error(`Error fetching metadata for book ID ${bookId}:`, error);
        if (axios.isAxiosError(error) && error.response?.status === 404) {
            throw new Error(`Metadata for book with ID ${bookId} not found. The book may not exist or metadata is unavailable.`);
        }
        throw new Error(`Failed to fetch or parse metadata for book ID ${bookId}.`);
    }
}

//#region Helper functions for metadata extraction
const extractTitle = ($: cheerio.CheerioAPI): string => {
    return (
        $('#book_title').text().trim() ||
        $('meta[name="title"]').attr('content') ||
        $('h1').first().text().trim() ||
        "Unknown Title"
    );
};

const extractAuthor = ($: cheerio.CheerioAPI): string => {
    return (
        $('a[rel="marcrel:aut"]').text().trim() ||
        $('tr:has(th:contains("Author")) td').text().trim() ||
        "Unknown Author"
    );
};

const extractLanguage = ($: cheerio.CheerioAPI): string => {
    return $('tr[property="dcterms:language"] td').text().trim() || "Unknown Language";
};

const extractReleaseDate = ($: cheerio.CheerioAPI): string => {
    return $('tr:has(th:contains("Release Date")) td').text().trim() || "Unknown Release Date";
};

const extractSubjects = ($: cheerio.CheerioAPI): string[] => {
    const subjects = $('tr:has(th:contains("Subject")) td a')
        .map((_, el) => $(el).text().trim())
        .get();
    return subjects.length > 0 ? subjects : [];
};

const extractMetaData = ($: cheerio.CheerioAPI): BookMetadata => {
    return {
        title: extractTitle($),
        author: extractAuthor($),
        language: extractLanguage($),
        releaseDate: extractReleaseDate($),
        subjects: extractSubjects($),
    };
};
//#endregion