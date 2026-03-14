/**
 * OCR Engine — Extracts text from page images using Tesseract or Google Vision
 * 
 * Provides a unified interface for OCR with multiple backend options.
 * Primary: Tesseract.js (no API key needed)
 * Fallback: Google Vision API (if GOOGLE_API_KEY is set)
 */

import * as fs from 'fs';

export interface OCRBlock {
    text: string;
    confidence: number;
    bbox?: { x: number; y: number; width: number; height: number };
}

export interface OCRResult {
    pageNumber: number;
    fullText: string;
    blocks: OCRBlock[];
    confidence: number;
}

/**
 * Run OCR on a page image using Tesseract.js.
 */
async function ocrWithTesseract(imagePath: string): Promise<{ text: string; confidence: number; blocks: OCRBlock[] }> {
    const Tesseract = await import('tesseract.js');

    const result = await Tesseract.recognize(imagePath, 'eng', {
        logger: () => { }, // Suppress progress logs
    });

    const blocks: OCRBlock[] = result.data.paragraphs?.map((p: any) => ({
        text: p.text.trim(),
        confidence: p.confidence,
        bbox: p.bbox ? {
            x: p.bbox.x0,
            y: p.bbox.y0,
            width: p.bbox.x1 - p.bbox.x0,
            height: p.bbox.y1 - p.bbox.y0,
        } : undefined,
    })) || [];

    return {
        text: result.data.text,
        confidence: result.data.confidence,
        blocks,
    };
}

/**
 * Run OCR using Google Vision API (higher accuracy for printed text).
 */
async function ocrWithGoogleVision(imagePath: string): Promise<{ text: string; confidence: number; blocks: OCRBlock[] }> {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) throw new Error('GOOGLE_API_KEY not set');

    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');

    const response = await fetch(
        `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                requests: [{
                    image: { content: base64Image },
                    features: [{ type: 'TEXT_DETECTION', maxResults: 1 }],
                }],
            }),
        }
    );

    if (!response.ok) {
        throw new Error(`Google Vision API error: ${response.status}`);
    }

    const data = await response.json();
    const annotation = data.responses?.[0]?.fullTextAnnotation;

    if (!annotation) {
        return { text: '', confidence: 0, blocks: [] };
    }

    const blocks: OCRBlock[] = annotation.pages?.[0]?.blocks?.map((block: any) => {
        const vertices = block.boundingBox?.vertices || [];
        return {
            text: block.paragraphs?.map((p: any) =>
                p.words?.map((w: any) =>
                    w.symbols?.map((s: any) => s.text).join('')
                ).join(' ')
            ).join('\n') || '',
            confidence: block.confidence || 0.9,
            bbox: vertices.length >= 2 ? {
                x: vertices[0]?.x || 0,
                y: vertices[0]?.y || 0,
                width: (vertices[1]?.x || 0) - (vertices[0]?.x || 0),
                height: (vertices[2]?.y || 0) - (vertices[0]?.y || 0),
            } : undefined,
        };
    }) || [];

    return {
        text: annotation.text || '',
        confidence: 0.95,
        blocks,
    };
}

/**
 * Run OCR on a page image. Tries Google Vision first (if API key available),
 * then falls back to Tesseract.js.
 */
export async function runOCR(
    imagePath: string,
    pageNumber: number,
    preferredEngine?: 'tesseract' | 'google-vision'
): Promise<OCRResult> {
    const useGoogle = preferredEngine === 'google-vision' ||
        (!preferredEngine && process.env.GOOGLE_API_KEY);

    let result: { text: string; confidence: number; blocks: OCRBlock[] };

    try {
        if (useGoogle) {
            console.log(`📷 Page ${pageNumber}: OCR via Google Vision...`);
            result = await ocrWithGoogleVision(imagePath);
        } else {
            console.log(`📷 Page ${pageNumber}: OCR via Tesseract.js...`);
            result = await ocrWithTesseract(imagePath);
        }
    } catch (error: any) {
        // Fallback to Tesseract if Google Vision fails
        if (useGoogle) {
            console.log(`⚠️ Google Vision failed, falling back to Tesseract: ${error.message}`);
            try {
                result = await ocrWithTesseract(imagePath);
            } catch (tessError: any) {
                console.error(`❌ Both OCR engines failed for page ${pageNumber}`);
                return {
                    pageNumber,
                    fullText: '',
                    blocks: [],
                    confidence: 0,
                };
            }
        } else {
            console.error(`❌ OCR failed for page ${pageNumber}: ${error.message}`);
            return {
                pageNumber,
                fullText: '',
                blocks: [],
                confidence: 0,
            };
        }
    }

    console.log(`✅ Page ${pageNumber}: ${result.text.length} chars extracted (confidence: ${Math.round(result.confidence)}%)`);

    return {
        pageNumber,
        fullText: result.text,
        blocks: result.blocks,
        confidence: result.confidence,
    };
}

/**
 * Run OCR on multiple page images sequentially.
 */
export async function runOCRBatch(
    pages: { pageNumber: number; imagePath: string }[],
    preferredEngine?: 'tesseract' | 'google-vision'
): Promise<OCRResult[]> {
    const results: OCRResult[] = [];

    for (const page of pages) {
        const result = await runOCR(page.imagePath, page.pageNumber, preferredEngine);
        results.push(result);
    }

    return results;
}
