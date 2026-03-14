/**
 * Database Insert — Batch inserts validated questions into the Supabase `questions` table
 * 
 * Uses the service role key to bypass RLS for admin bulk operations.
 * Prevents duplicates via question_text hash comparison.
 */

import * as crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import type { MappedQuestion } from './syllabus-mapper';

const BATCH_SIZE = 100;

function getSupabase() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error('Supabase env vars not set');
    return createClient(url, key);
}

/**
 * Generate a hash for duplicate detection.
 */
function questionHash(text: string): string {
    return crypto.createHash('sha256')
        .update(text.toLowerCase().replace(/\s+/g, ' ').trim())
        .digest('hex')
        .slice(0, 32);
}

export interface InsertResult {
    inserted: number;
    skipped: number;
    errors: number;
    total: number;
}

/**
 * Check which questions already exist in the database.
 * Returns a Set of question_text hashes that are already stored.
 */
async function getExistingHashes(supabase: any): Promise<Set<string>> {
    const { data, error } = await supabase
        .from('questions')
        .select('question_text');

    if (error) {
        console.error(`⚠️ Could not fetch existing questions for dedup: ${error.message}`);
        return new Set();
    }

    const hashes = new Set<string>();
    for (const row of data || []) {
        hashes.add(questionHash(row.question_text));
    }

    console.log(`📊 Found ${hashes.size} existing questions in database`);
    return hashes;
}

/**
 * Insert questions into the `questions` table in batches.
 */
export async function insertQuestions(questions: MappedQuestion[]): Promise<InsertResult> {
    const supabase = getSupabase();
    const result: InsertResult = { inserted: 0, skipped: 0, errors: 0, total: questions.length };

    // Load existing hashes for dedup
    const existingHashes = await getExistingHashes(supabase);

    // Filter out duplicates
    const newQuestions = questions.filter(q => {
        const hash = questionHash(q.question_text);
        if (existingHashes.has(hash)) {
            result.skipped++;
            return false;
        }
        return true;
    });

    if (result.skipped > 0) {
        console.log(`⏭️  Skipped ${result.skipped} duplicate questions`);
    }

    // Batch insert
    for (let i = 0; i < newQuestions.length; i += BATCH_SIZE) {
        const batch = newQuestions.slice(i, i + BATCH_SIZE);
        const batchNum = Math.floor(i / BATCH_SIZE) + 1;
        const totalBatches = Math.ceil(newQuestions.length / BATCH_SIZE);

        const rows = batch.map(q => ({
            topic_id: q.topic_id,
            exam_id: q.exam_id,
            question_text: q.question_text,
            options: JSON.stringify(q.options),
            correct_option: q.correct_option,
            difficulty: q.difficulty || 'Medium',
            question_type: q.question_type || 'single_correct',
            is_pyq: q.is_pyq || false,
            year: q.year || null,
            shift: q.shift || null,
            marks: 4, // Default JEE/NEET marking
            negative_marks: 1,
            explanation: q.explanation || null,
        }));

        const { data, error } = await supabase
            .from('questions')
            .insert(rows)
            .select('id');

        if (error) {
            console.error(`❌ Batch ${batchNum}/${totalBatches}: insert failed — ${error.message}`);
            result.errors += batch.length;
        } else {
            const count = data?.length || batch.length;
            result.inserted += count;
            console.log(`✅ Batch ${batchNum}/${totalBatches}: inserted ${count} questions`);
        }
    }

    return result;
}

/**
 * Print a summary of the insert operation.
 */
export function printInsertSummary(result: InsertResult): void {
    console.log('\n' + '='.repeat(50));
    console.log('📊 INSERTION SUMMARY');
    console.log('='.repeat(50));
    console.log(`   Total input:    ${result.total}`);
    console.log(`   ✅ Inserted:    ${result.inserted}`);
    console.log(`   ⏭️  Skipped:     ${result.skipped} (duplicates)`);
    console.log(`   ❌ Errors:      ${result.errors}`);
    console.log('='.repeat(50) + '\n');
}
