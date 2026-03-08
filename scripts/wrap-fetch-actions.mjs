/**
 * Script to wrap all read-only server action functions with safeFetchAction.
 * Transforms: export async function fetchName(params) { body }
 * Into:       export const fetchName = safeFetchAction(async (params) => { body });
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const files = [
  'src/modules/admissions/admission-fetch-actions.ts',
  'src/modules/datesheet/datesheet-fetch-actions.ts',
  'src/modules/timetable/timetable-fetch-actions.ts',
  'src/modules/diary/diary-fetch-actions.ts',
  'src/modules/results/result-fetch-actions.ts',
  'src/modules/settings/reference-actions.ts',
  'src/modules/exams/exam-fetch-actions.ts',
  'src/modules/classes/class-fetch-actions.ts',
  'src/modules/questions/question-fetch-actions.ts',
  'src/modules/users/user-fetch-actions.ts',
  'src/modules/subjects/subject-fetch-actions.ts',
  'src/modules/departments/department-fetch-actions.ts',
  'src/modules/grading/grading-fetch-actions.ts',
  'src/modules/academic-sessions/session-fetch-actions.ts',
  'src/modules/family/family-dashboard-actions.ts',
  'src/modules/family/family-profile-actions.ts',
  'src/modules/family/family-results-actions.ts',
  'src/modules/family/family-diary-actions.ts',
  'src/modules/written-exams/written-exam-fetch-actions.ts',
  'src/modules/notifications/notification-fetch-actions.ts',
  'src/modules/sessions/session-fetch-actions.ts',
  'src/modules/family/family-exam-actions.ts',
  'src/modules/family/family-search-actions.ts',
  'src/modules/family/family-attendance-actions.ts',
];

let totalWrapped = 0;
let totalFiles = 0;

for (const relPath of files) {
  const filePath = path.resolve(ROOT, relPath);
  if (!fs.existsSync(filePath)) {
    console.log(`MISSING: ${relPath}`);
    continue;
  }

  let src = fs.readFileSync(filePath, 'utf-8');
  if (src.includes('safeFetchAction')) {
    console.log(`SKIP (already wrapped): ${relPath}`);
    continue;
  }

  // --- Add import after last "from '...'" line ---
  const lines = src.split('\n');
  let lastFromLine = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(" from '") || lines[i].includes(' from "')) {
      lastFromLine = i;
    }
  }
  lines.splice(lastFromLine + 1, 0, "import { safeFetchAction } from '@/lib/safe-action';");
  src = lines.join('\n');

  // --- Find and wrap exported async functions (from end to start) ---
  const regex = /export async function (\w+)\(/g;
  const matches = [...src.matchAll(regex)];
  let wrapped = 0;

  for (let m = matches.length - 1; m >= 0; m--) {
    const name = matches[m][1];

    // Only wrap fetch/search functions, skip mutations
    if (!name.startsWith('fetch') && !name.startsWith('search')) continue;

    const start = matches[m].index;
    let pos = start + matches[m][0].length; // right after opening (

    // Find matching closing paren for params
    let depth = 1;
    while (pos < src.length && depth > 0) {
      if (src[pos] === '(') depth++;
      else if (src[pos] === ')') depth--;
      pos++;
    }
    const paramsEnd = pos; // right after )
    const params = src.slice(start + matches[m][0].length, paramsEnd - 1);

    // Find opening brace (skip return type annotation)
    while (pos < src.length && src[pos] !== '{') pos++;
    const openBrace = pos;

    // Get annotation between ) and {
    const rawAnnotation = src.slice(paramsEnd, openBrace).trim();

    // Find matching closing brace
    depth = 1;
    pos = openBrace + 1;
    while (pos < src.length && depth > 0) {
      const ch = src[pos];
      if (ch === '{') depth++;
      else if (ch === '}') depth--;
      else if (ch === "'" || ch === '"' || ch === '`') {
        const q = ch;
        pos++;
        while (pos < src.length && src[pos] !== q) {
          if (src[pos] === '\\') pos++;
          pos++;
        }
      } else if (ch === '/' && pos + 1 < src.length && src[pos + 1] === '/') {
        while (pos < src.length && src[pos] !== '\n') pos++;
      }
      pos++;
    }
    const closeBrace = pos - 1;

    const body = src.slice(openBrace + 1, closeBrace);
    const annot = rawAnnotation ? ` ${rawAnnotation}` : '';

    const newFunc = `export const ${name} = safeFetchAction(async (${params})${annot} => {${body}});`;

    src = src.slice(0, start) + newFunc + src.slice(closeBrace + 1);
    wrapped++;
  }

  if (wrapped > 0) {
    fs.writeFileSync(filePath, src, 'utf-8');
    console.log(`${relPath}: ${wrapped} functions wrapped`);
    totalWrapped += wrapped;
    totalFiles++;
  } else {
    console.log(`${relPath}: 0 wrapped (no qualifying functions found)`);
  }
}

console.log(`\nTotal: ${totalWrapped} functions wrapped in ${totalFiles} files`);
