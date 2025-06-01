import axios from 'axios';

export async function fetchBookText(bookId: string): Promise<string> {
    try {
        const textUrl = `https://www.gutenberg.org/cache/epub/${bookId}/pg${bookId}.txt`;
        const textRes = await axios.get(textUrl);
        return textRes.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
            throw new Error(`Text for book with ID ${bookId} not found. Please check the ID and try again.`);
        }
        throw new Error(`Failed to fetch text for book ID ${bookId}. The book may not be available in plain text format.`);
    }
} 