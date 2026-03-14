/**
 * GET /api/tests/[testId]/results
 *
 * Contract-specified alias for GET /api/tests/[testId]/analysis.
 * Returns the full scored result breakdown after a test is completed.
 *
 * Delegates to the analysis handler — same data, same shape.
 */

import { NextRequest } from 'next/server';
import { GET as analysisGET } from '../analysis/route';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ testId: string }> }
) {
  return analysisGET(request, context);
}
