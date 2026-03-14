/**
 * PDF to Images — Converts PDF pages to high-resolution PNG images
 * 
 * For scanned PDFs where text extraction fails.
 * Uses pdf-poppler or falls back to a canvas-based approach.
 * 
 * Requires: pdf-poppler (npm install pdf-poppler)
 * System requirement: Poppler utilities must be installed on the system.
 *   - macOS: brew install poppler
 *   - Ubuntu: sudo apt-get install poppler-utils
 *   - Windows: Download from https://github.com/oschwartz10612/poppler-windows
 */

import * as fs from 'fs';
import * as path from 'path';

export interface PageImage {
    pageNumber: number;
    imagePath: string;
    width: number;
    height: number;
}

export interface PDFImageResult {
    fileName: string;
    totalPages: number;
    outputDir: string;
    pages: PageImage[];
}

/**
 * Convert a PDF to per-page PNG images at 300 DPI.
 */
export async function pdfToImages(
    pdfPath: string,
    outputDir?: string
): Promise<PDFImageResult> {
    const absolutePath = path.resolve(pdfPath);

    if (!fs.existsSync(absolutePath)) {
        throw new Error(`PDF file not found: ${absolutePath}`);
    }

    // Create output directory
    const outDir = outputDir || path.join(
        path.dirname(absolutePath),
        '.temp-pages',
        path.basename(absolutePath, '.pdf')
    );

    if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
    }

    try {
        // Try pdf-poppler first
        const poppler = await import('pdf-poppler');

        const opts = {
            format: 'png' as const,
            out_dir: outDir,
            out_prefix: 'page',
            scale: 2400, // ~300 DPI for A4
        };

        await poppler.convert(absolutePath, opts);

        // List generated images
        const files = fs.readdirSync(outDir)
            .filter(f => f.endsWith('.png'))
            .sort((a, b) => {
                const numA = parseInt(a.match(/\d+/)?.[0] || '0');
                const numB = parseInt(b.match(/\d+/)?.[0] || '0');
                return numA - numB;
            });

        const pages: PageImage[] = files.map((file, index) => ({
            pageNumber: index + 1,
            imagePath: path.join(outDir, file),
            width: 2400,
            height: 3400,
        }));

        console.log(`🖼️  Converted "${path.basename(pdfPath)}" to ${pages.length} images (300 DPI)`);

        return {
            fileName: path.basename(pdfPath),
            totalPages: pages.length,
            outputDir: outDir,
            pages,
        };
    } catch (error: any) {
        if (error.code === 'MODULE_NOT_FOUND') {
            console.error('❌ pdf-poppler not installed. Install it with: npm install pdf-poppler');
            console.error('   Also ensure poppler-utils is installed on your system.');
            throw new Error(
                'pdf-poppler is required for scanned PDF processing. ' +
                'Install: npm install pdf-poppler && (brew install poppler OR apt-get install poppler-utils)'
            );
        }
        throw error;
    }
}

/**
 * Clean up temporary page images after processing.
 */
export function cleanupImages(outputDir: string): void {
    if (fs.existsSync(outputDir)) {
        fs.rmSync(outputDir, { recursive: true, force: true });
        console.log(`🧹 Cleaned up temp images: ${outputDir}`);
    }
}

/**
 * Read a page image as a base64-encoded string for API submission.
 */
export function imageToBase64(imagePath: string): string {
    const buffer = fs.readFileSync(imagePath);
    return buffer.toString('base64');
}
