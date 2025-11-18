// backend/services/resumeParser.js
import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

let pdf = null;
try {
  const mod = require('pdf-parse');
  if (typeof mod === 'function') pdf = mod;
  else if (mod && typeof mod.default === 'function') pdf = mod.default;
} catch (e) {
  // ignore, handle below
}

if (!pdf) {
  // try dynamic import fallback
  try {
    // eslint-disable-next-line no-await-in-loop
    const imported = await import('pdf-parse').catch(() => null);
    if (imported && typeof imported.default === 'function') pdf = imported.default;
    if (typeof imported === 'function') pdf = imported;
  } catch (e) { /* ignore */ }
}

if (!pdf) {
  throw new Error('pdf-parse could not be loaded. Try: npm remove pdf-parse && npm i pdf-parse@1.1.1');
}

const curatedSkills = [
  'javascript','react','node','express','mongodb','sql','postgresql','typescript',
  'html','css','redux','docker','aws','git','python'
];

function normalizeWords(text = '') {
  return text
    .toLowerCase()
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

export async function parsePDF(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdf(dataBuffer);
  const text = data && data.text ? data.text : '';
  const tokens = normalizeWords(text);

  const found = new Set();
  for (const s of curatedSkills) {
    if (tokens.includes(s)) found.add(s);
    if (s === 'node' && tokens.includes('nodejs')) found.add('node');
    if (s === 'mongodb' && tokens.includes('mongo')) found.add('mongodb');
  }

  return {
    text,
    skills: Array.from(found),
    wordCount: tokens.length
  };
}
