/**
 * OCR Engine — Extracts text from page images using Tesseract or Featherless Vision
 * 
 * Provides a unified interface for OCR with multiple backend options.
 * Primary: Tesseract.js (no API key needed)
 * Fallback: Featherless Vision (if FEATHERLESS_API_KEY / STITCH_API_KEY is set)
 */

import * as fs from 'fs';
import { callFeatherlessChat, getFeatherlessApiKey, getFeatherlessModel } from './featherless-client';

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
 * Run OCR using Featherless vision model.
 */
async function ocrWithFeatherlessVision(imagePath: string): Promise<{ text: string; confidence: number; blocks: OCRBlock[] }> {
    const apiKey = getFeatherlessApiKey();
    if (!apiKey) throw new Error('FEATHERLESS_API_KEY (or STITCH_API_KEY / AI_API_KEY) not set');

    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    const mimeType = imagePath.endsWith('.png') ? 'image/png' : 'image/jpeg';

    const text = await callFeatherlessChat([
        {
            role: 'user',
            content: [
                {
                    type: 'image_url',
                    image_url: { url: `data:${mimeType};base64,${base64Image}` },
                },
                {
                    type: 'text',
                    text: 'Extract all readable text from this image. Return only plain text with line breaks where sensible.',
                },
            ],
        },
    ], {
        model: getFeatherlessModel('meta-llama/Llama-3.2-11B-Vision-Instruct'),
        temperature: 0,
        max_tokens: 4000,
    });

    const normalized = text.trim();
    if (!normalized) {
        return { text: '', confidence: 0, blocks: [] };
    }

    const blocks: OCRBlock[] = normalized
        .split(/\n+/)
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => ({ text: line, confidence: 0.85 }));

    return {
        text: normalized,
        confidence: 0.85,
        blocks,
    };
}

/**
 * Run OCR on a page image. Tries Featherless vision first (if API key available),
 * then falls back to Tesseract.js.
 */
export async function runOCR(
    imagePath: string,
    pageNumber: number,
    preferredEngine?: 'tesseract' | 'featherless-vision' | 'google-vision'
): Promise<OCRResult> {
    const useFeatherlessVision =
        preferredEngine === 'featherless-vision' ||
        preferredEngine === 'google-vision' ||
        (!preferredEngine && !!getFeatherlessApiKey());

    let result: { text: string; confidence: number; blocks: OCRBlock[] };

    try {
        if (useFeatherlessVision) {
            console.log(`📷 Page ${pageNumber}: OCR via Featherless Vision...`);
            result = await ocrWithFeatherlessVision(imagePath);
        } else {
            console.log(`📷 Page ${pageNumber}: OCR via Tesseract.js...`);
            result = await ocrWithTesseract(imagePath);
        }
    } catch (error: any) {
        // Fallback to Tesseract if vision OCR fails
        if (useFeatherlessVision) {
            console.log(`⚠️ Featherless Vision failed, falling back to Tesseract: ${error.message}`);
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
    preferredEngine?: 'tesseract' | 'featherless-vision' | 'google-vision'
): Promise<OCRResult[]> {
    const results: OCRResult[] = [];

    for (const page of pages) {
        const result = await runOCR(page.imagePath, page.pageNumber, preferredEngine);
        results.push(result);
    }

    return results;
}
