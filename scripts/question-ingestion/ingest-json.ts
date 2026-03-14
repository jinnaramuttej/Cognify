/**
 * Ingest JSON — CLI entry point for bulk JSON question import
 * 
 * Usage:
 *   npx tsx scripts/question-ingestion/ingest-json.ts <json-path> [options]
 * 
 * Options:
 *   --exam <name>       Exam name (e.g., "JEE Main", "NEET")
 *   --subject <name>    Subject filter
 *   --dry-run           Validate without inserting
 * 
 * JSON Format:
 * [
 *   {
 *     "question_text": "What is the SI unit of force?",
 *     "options": [
 *       {"label": "A", "text": "Joule"},
 *       {"label": "B", "text": "Newton"},
 *       {"label": "C", "text": "Watt"},
 *       {"label": "D", "text": "Pascal"}
 *     ],
 *     "correct_option": "B",
 *     "difficulty": "Easy",
 *     "question_type": "single_correct",
 *     "topic_hint": "Units and Measurements",
 *     "is_pyq": true,
 *     "year": 2023
 *   }
 * ]
 * 
 * Fields topic_id and exam_id can be provided directly to skip syllabus mapping.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { validateQuestions } from './validator';
import { mapQuestions } from './syllabus-mapper';
import { insertQuestions, printInsertSummary } from './db-insert';
import type { RawQuestion } from './ai-parser';

// ─── CLI Argument Parsing ───────────────────────────────────────

function parseArgs() {
    const args = process.argv.slice(2);

    if (args.length === 0 || args.includes('--help')) {
        console.log(`
📋 Cognify Question Ingestion Pipeline (JSON)

Usage:
  npx tsx scripts/question-ingestion/ingest-json.ts <json-path> [options]

Options:
  --exam <name>       Exam name for syllabus mapping
  --subject <name>    Subject filter
  --dry-run           Validate without inserting

Example:
  npx tsx scripts/question-ingestion/ingest-json.ts ./datasets/questions.json --exam "JEE Main"
`);
        process.exit(0);
    }

    const jsonPath = args[0];
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

    return { jsonPath, options };
}

// ─── Main Pipeline ──────────────────────────────────────────────

async function main() {
    const startTime = Date.now();
    const { jsonPath, options } = parseArgs();

    const absolutePath = path.resolve(jsonPath);
    const dryRun = options.dryRun === 'true';
    const context = {
        exam: options.exam,
        subject: options.subject,
    };

    console.log('\n' + '═'.repeat(60));
    console.log('🚀 COGNIFY QUESTION INGESTION (JSON)');
    console.log('═'.repeat(60));
    console.log(`📄 File: ${jsonPath}`);
    console.log(`📝 Exam: ${context.exam || 'auto-detect'}`);
    console.log(`🧪 Dry run: ${dryRun}`);
    console.log('─'.repeat(60) + '\n');

    // ── Step 1: Load JSON ─────────────────────────────────────
    if (!fs.existsSync(absolutePath)) {
        console.error(`❌ File not found: ${absolutePath}`);
        process.exit(1);
    }

    let rawData: any[];
    try {
        const fileContent = fs.readFileSync(absolutePath, 'utf-8');
        rawData = JSON.parse(fileContent);

        if (!Array.isArray(rawData)) {
            console.error('❌ JSON file must contain an array of question objects');
            process.exit(1);
        }
    } catch (e: any) {
        console.error(`❌ Failed to parse JSON: ${e.message}`);
        process.exit(1);
    }

    console.log(`📊 Loaded ${rawData.length} questions from JSON\n`);

    // ── Step 2: Convert to RawQuestion format ─────────────────
    const rawQuestions: RawQuestion[] = rawData.map(item => ({
        question_text: item.question_text || '',
        options: item.options || [],
        correct_option: item.correct_option || '',
        difficulty: item.difficulty || 'Medium',
        question_type: item.question_type || 'single_correct',
        year: item.year,
        shift: item.shift,
        is_pyq: item.is_pyq ?? false,
        explanation: item.explanation,
        topic_hint: item.topic_hint || item.topic || '',
    }));

    // ── Step 3: Validate ──────────────────────────────────────
    console.log('✅ VALIDATION');
    console.log('─'.repeat(40));

    const { valid, invalid } = validateQuestions(rawQuestions);

    console.log(`   Valid:   ${valid.length}`);
    console.log(`   Invalid: ${invalid.length}`);

    if (invalid.length > 0) {
        console.log('\n   Rejected:');
        for (const inv of invalid.slice(0, 5)) {
            console.log(`   ❌ "${inv.question_text}..." — ${inv.reasons.join(', ')}`);
        }
        if (invalid.length > 5) console.log(`   ... and ${invalid.length - 5} more`);
    }

    if (valid.length === 0) {
        console.log('\n⚠️ No valid questions.');
        process.exit(1);
    }

    // ── Step 4: Check for pre-mapped IDs ──────────────────────
    const preMapped = rawData.some(q => q.topic_id && q.exam_id);

    let finalQuestions;

    if (preMapped) {
        console.log('\n🗺️  Using pre-mapped topic_id/exam_id from JSON');
        finalQuestions = valid.map((q, i) => ({
            ...q,
            topic_id: rawData[i]?.topic_id || null,
            exam_id: rawData[i]?.exam_id || null,
        }));
    } else {
        // ── Step 5: Map to syllabus ─────────────────────────────
        console.log('\n🗺️  SYLLABUS MAPPING');
        console.log('─'.repeat(40));

        const { mapped } = await mapQuestions(valid, context);
        finalQuestions = mapped;
    }

    // ── Step 6: Insert ────────────────────────────────────────
    if (dryRun) {
        console.log('\n🧪 DRY RUN — Skipping database insert');
        console.log(`   Would insert ${finalQuestions.length} questions`);
    } else {
        console.log('\n💾 DATABASE INSERT');
        console.log('─'.repeat(40));

        const result = await insertQuestions(finalQuestions);
        printInsertSummary(result);
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`⏱️  Completed in ${elapsed}s\n`);
}

// ── Run ─────────────────────────────────────────────────────────
main().catch(err => {
    console.error('\n💥 Pipeline error:', err.message);
    process.exit(1);
});
