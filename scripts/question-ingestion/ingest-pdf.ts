/**
 * Ingest PDF — Main CLI entry point for PDF question ingestion
 * 
 * Supports both text-based and scanned (vision-based) PDF processing.
 * 
 * Usage:
 *   npx tsx scripts/question-ingestion/ingest-pdf.ts <pdf-path> [options]
 * 
 * Options:
 *   --exam <name>         Exam name (e.g., "JEE Main", "NEET")
 *   --subject <name>      Subject (e.g., "Physics", "Chemistry")
 *   --year <number>       Year of the paper
 *   --mode <text|vision>  Processing mode (default: auto-detect)
 *   --dry-run             Validate without inserting into database
 * 
 * Examples:
 *   npx tsx scripts/question-ingestion/ingest-pdf.ts ./datasets/jee_main_physics_pyq.pdf --exam "JEE Main" --subject Physics --year 2024
 *   npx tsx scripts/question-ingestion/ingest-pdf.ts ./datasets/neet_scanned.pdf --mode vision --exam NEET
 */

import * as path from 'path';
import * as dotenv from 'dotenv';

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { parsePDF } from './pdf-parser';
import { parseAllPages } from './ai-parser';
import { pdfToImages, cleanupImages } from './pdf-to-images';
import { parseAllPagesWithVision } from './vision-parser';
import { structureFromVision, structureFromText, mergeAndDeduplicate } from './question-structurer';
import { validateQuestions } from './validator';
import { mapQuestions } from './syllabus-mapper';
import { insertQuestions, printInsertSummary } from './db-insert';

// ─── CLI Argument Parsing ───────────────────────────────────────

function parseArgs() {
    const args = process.argv.slice(2);

    if (args.length === 0 || args.includes('--help')) {
        console.log(`
📄 Cognify Question Ingestion Pipeline (PDF)

Usage:
  npx tsx scripts/question-ingestion/ingest-pdf.ts <pdf-path> [options]

Options:
  --exam <name>         Exam name (e.g., "JEE Main", "NEET")
  --subject <name>      Subject (e.g., "Physics", "Chemistry")
  --year <number>       Year of the paper
  --mode <text|vision>  Processing mode (default: auto-detect)
  --dry-run             Validate without inserting into database

Examples:
  npx tsx scripts/question-ingestion/ingest-pdf.ts ./datasets/jee_physics.pdf --exam "JEE Main" --subject Physics
  npx tsx scripts/question-ingestion/ingest-pdf.ts ./datasets/neet_scanned.pdf --mode vision --exam NEET --year 2024
`);
        process.exit(0);
    }

    const pdfPath = args[0];
    const options: Record<string, string> = {};

    for (let i = 1; i < args.length; i++) {
        if (args[i].startsWith('--')) {
            const key = args[i].slice(2);
            if (key === 'dry-run') {
                options['dryRun'] = 'true';
            } else if (i + 1 < args.length && !args[i + 1].startsWith('--')) {
                options[key] = args[i + 1];
                i++;
            }
        }
    }

    return { pdfPath, options };
}

// ─── Main Pipeline ──────────────────────────────────────────────

async function main() {
    const startTime = Date.now();
    const { pdfPath, options } = parseArgs();

    const context = {
        exam: options.exam,
        subject: options.subject,
        year: options.year ? parseInt(options.year) : undefined,
    };

    const mode = options.mode as 'text' | 'vision' | undefined;
    const dryRun = options.dryRun === 'true';

    console.log('\n' + '═'.repeat(60));
    console.log('🚀 COGNIFY QUESTION INGESTION PIPELINE');
    console.log('═'.repeat(60));
    console.log(`📄 File: ${pdfPath}`);
    console.log(`📝 Exam: ${context.exam || 'auto-detect'}`);
    console.log(`📘 Subject: ${context.subject || 'auto-detect'}`);
    console.log(`📅 Year: ${context.year || 'auto-detect'}`);
    console.log(`⚙️  Mode: ${mode || 'auto-detect'}`);
    console.log(`🧪 Dry run: ${dryRun}`);
    console.log('─'.repeat(60) + '\n');

    // ── Step 1: Determine processing mode ─────────────────────
    let useVision = mode === 'vision';

    if (!mode) {
        // Auto-detect: try text extraction first
        console.log('🔍 Auto-detecting PDF type...');
        try {
            const testParse = await parsePDF(pdfPath);
            const textLength = testParse.raw_text.replace(/\s/g, '').length;
            const pagesWithText = testParse.pages.filter(p => p.text.trim().length > 50).length;

            if (textLength < 500 || pagesWithText < testParse.totalPages * 0.3) {
                console.log('📸 Detected scanned PDF — switching to vision mode');
                useVision = true;
            } else {
                console.log('📝 Detected text-based PDF — using text extraction');
                useVision = false;
            }
        } catch {
            console.log('📸 Text extraction failed — using vision mode');
            useVision = true;
        }
    }

    // ── Step 2: Extract questions ─────────────────────────────
    let rawQuestions: import('./ai-parser').RawQuestion[] = [];

    if (useVision) {
        // Vision pipeline: PDF → Images → Vision AI
        console.log('\n📸 VISION PIPELINE');
        console.log('─'.repeat(40));

        const imageResult = await pdfToImages(pdfPath);

        try {
            const visionResults = await parseAllPagesWithVision(
                imageResult.pages.map(p => ({ pageNumber: p.pageNumber, imagePath: p.imagePath })),
                context
            );

            rawQuestions = structureFromVision(visionResults, {
                year: context.year,
                is_pyq: true,
                exam: context.exam,
            });
        } finally {
            // Clean up temp images
            cleanupImages(imageResult.outputDir);
        }
    } else {
        // Text pipeline: PDF → Text → AI Parser
        console.log('\n📝 TEXT PIPELINE');
        console.log('─'.repeat(40));

        const parsed = await parsePDF(pdfPath);
        const aiQuestions = await parseAllPages(parsed.pages, context);

        rawQuestions = structureFromText(aiQuestions, {
            year: context.year,
            is_pyq: true,
        });
    }

    console.log(`\n📊 Extracted ${rawQuestions.length} raw questions\n`);

    if (rawQuestions.length === 0) {
        console.log('⚠️ No questions extracted. Check the PDF format and try a different mode.');
        process.exit(1);
    }

    // ── Step 3: Deduplicate ───────────────────────────────────
    rawQuestions = mergeAndDeduplicate([rawQuestions]);

    // ── Step 4: Validate ──────────────────────────────────────
    console.log('✅ VALIDATION');
    console.log('─'.repeat(40));

    const { valid, invalid } = validateQuestions(rawQuestions);

    console.log(`   Valid:   ${valid.length}`);
    console.log(`   Invalid: ${invalid.length}`);

    if (invalid.length > 0) {
        console.log('\n   Rejected questions:');
        for (const inv of invalid.slice(0, 5)) {
            console.log(`   ❌ "${inv.question_text}..." — ${inv.reasons.join(', ')}`);
        }
        if (invalid.length > 5) {
            console.log(`   ... and ${invalid.length - 5} more`);
        }
    }

    if (valid.length === 0) {
        console.log('\n⚠️ No valid questions to insert.');
        process.exit(1);
    }

    // ── Step 5: Map to syllabus ───────────────────────────────
    console.log('\n🗺️  SYLLABUS MAPPING');
    console.log('─'.repeat(40));

    const { mapped } = await mapQuestions(valid, context);

    // ── Step 6: Insert into database ──────────────────────────
    if (dryRun) {
        console.log('\n🧪 DRY RUN — Skipping database insert');
        console.log(`   Would insert ${mapped.length} questions`);
    } else {
        console.log('\n💾 DATABASE INSERT');
        console.log('─'.repeat(40));

        const result = await insertQuestions(mapped);
        printInsertSummary(result);
    }

    // ── Summary ───────────────────────────────────────────────
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`⏱️  Completed in ${elapsed}s\n`);
}

// ── Run ─────────────────────────────────────────────────────────
main().catch(err => {
    console.error('\n💥 Pipeline error:', err.message);
    process.exit(1);
});
