/**
 * Diagram Handler — Extracts and stores diagram images from question pages
 * 
 * Detects diagram regions in page images and uploads them to Supabase Storage.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const BUCKET_NAME = 'question-diagrams';

/**
 * Get Supabase client with service role (for storage access).
 */
function getSupabase() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error('Supabase env vars not set');
    return createClient(url, key);
}

export interface DiagramResult {
    diagramId: string;
    description: string;
    publicUrl: string | null;
    storagePath: string;
}

/**
 * Upload a diagram image to Supabase Storage.
 * Returns the public URL of the uploaded image.
 */
export async function uploadDiagram(
    imageBuffer: Buffer,
    description: string,
    metadata?: { exam?: string; subject?: string; questionNum?: number }
): Promise<DiagramResult> {
    const supabase = getSupabase();

    const hash = crypto.createHash('md5').update(imageBuffer).digest('hex').slice(0, 12);
    const fileName = `diagram_${hash}.png`;
    const storagePath = metadata?.exam
        ? `${metadata.exam}/${metadata.subject || 'general'}/${fileName}`
        : `general/${fileName}`;

    // Ensure bucket exists (idempotent)
    try {
        await supabase.storage.createBucket(BUCKET_NAME, { public: true });
    } catch {
        // Bucket already exists — fine
    }

    const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(storagePath, imageBuffer, {
            contentType: 'image/png',
            upsert: true,
        });

    if (error) {
        console.error(`❌ Diagram upload failed: ${error.message}`);
        return {
            diagramId: hash,
            description,
            publicUrl: null,
            storagePath,
        };
    }

    const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(storagePath);

    console.log(`📊 Diagram uploaded: ${storagePath}`);

    return {
        diagramId: hash,
        description,
        publicUrl: urlData.publicUrl,
        storagePath,
    };
}

/**
 * Process diagram descriptions from Vision AI output.
 * For now, stores descriptive text in the question_text field.
 * When full image cropping is available, this will upload actual diagram images.
 */
export function embedDiagramInQuestion(
    questionText: string,
    diagramDescription: string,
    diagramUrl?: string | null
): string {
    if (diagramUrl) {
        return `${questionText}\n\n![Diagram](${diagramUrl})\n*${diagramDescription}*`;
    }

    // Embed description as text if no image URL
    return `${questionText}\n\n[Diagram: ${diagramDescription}]`;
}
