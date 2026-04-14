import fs from 'node:fs';
import path from 'node:path';

export type StitchPageKey =
  | 'dashboard'
  | 'tests'
  | 'analytics'
  | 'cogni'
  | 'library'
  | 'notes'
  | 'arena'
  | 'settings';

export interface StitchPageSource {
  pageKey: StitchPageKey;
  bodyClassName: string;
  html: string;
  styles: string;
}

const STITCH_PROJECT_ID = '11699267970337931253';

export function getStitchPageSource(pageKey: StitchPageKey): StitchPageSource {
  const filePath = path.join(process.cwd(), '.stitch', STITCH_PROJECT_ID, `${pageKey}.html`);
  const rawHtml = fs.readFileSync(filePath, 'utf8');

  const bodyClassName = /<body\b[^>]*class="([^"]*)"/i.exec(rawHtml)?.[1] ?? '';
  const bodyHtml = /<body\b[^>]*>([\s\S]*?)<\/body>/i.exec(rawHtml)?.[1] ?? rawHtml;
  const styles = [...rawHtml.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)]
    .map((match) => match[1])
    .join('\n');

  return {
    pageKey,
    bodyClassName,
    styles,
    html: bodyHtml.replace(/<script\b[\s\S]*?<\/script>/gi, ''),
  };
}
