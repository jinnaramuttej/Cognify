/**
 * PDF Parser — Extracts raw text from PDF files
 * 
 * Uses pdf-parse to extract text content page by page.
 * Run: npx tsx scripts/question-ingestion/ingest-pdf.ts <path>
 */

import * as fs from 'fs';
import * as path from 'path';

interface ParsedPage {
    pageNumber: number;
    text: string;
}

export interface ParsedPDF {
    fileName: string;
    totalPages: number;
    raw_text: string;
    pages: ParsedPage[];
}

/**
 * Parse a PDF file and extract text content page by page.
 */
export async function parsePDF(filePath: string): Promise<ParsedPDF> {
    const absolutePath = path.resolve(filePath);

    if (!fs.existsSync(absolutePath)) {
        throw new Error(`PDF file not found: ${absolutePath}`);
    }

    const dataBuffer = fs.readFileSync(absolutePath);

    // pdf-parse uses dynamic require internally, so we import it dynamically
    const pdfParse = (await import('pdf-parse')).default;

    const pages: ParsedPage[] = [];
    let currentPage = 0;

    const data = await pdfParse(dataBuffer, {
        pagerender: async function (pageData: any) {
            const textContent = await pageData.getTextContent();
            const pageText = textContent.items
                .map((item: any) => item.str)
                .join(' ')
                .replace(/\s+/g, ' ')
                .trim();

            currentPage++;
            pages.push({
                pageNumber: currentPage,
                text: pageText,
            });

            return pageText;
        },
    });

    console.log(`📄 Parsed "${path.basename(filePath)}": ${data.numpages} pages, ${data.text.length} chars`);

    return {
        fileName: path.basename(filePath),
        totalPages: data.numpages,
        raw_text: data.text,
        pages: pages.length > 0 ? pages : [{
            pageNumber: 1,
            text: data.text,
        }],
    };
}
