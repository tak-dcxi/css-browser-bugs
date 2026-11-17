// Shared helpers: repository paths, frontmatter parsing, and the status vocabulary.
// Frontmatter is flat `key: value` lines so it can be parsed without a YAML library.

import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const BUGS_DIR = path.join(ROOT, 'bugs');

export const ENGINES = ['webkit', 'gecko', 'blink'];
export const ENGINE_LABELS = { webkit: 'WebKit', gecko: 'Gecko', blink: 'Blink' };

// Keep in sync with the status table in README.md.
export const STATUSES = [
  '-',
  'investigating',
  'not-affected',
  'not-a-bug',
  'unsupported',
  'cannot-reproduce',
  'duplicate',
  'drafted',
  'reported',
  'fixed',
];

export function parseFrontmatter(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!match) return null;
  const data = {};
  for (const line of match[1].split(/\r?\n/)) {
    if (!line.trim() || line.trimStart().startsWith('#')) continue;
    const colon = line.indexOf(':');
    if (colon < 0) continue;
    data[line.slice(0, colon).trim()] = line.slice(colon + 1).trim();
  }
  return data;
}

export function splitLinks(value) {
  return (value ?? '').split(/\s+/).filter(Boolean);
}

export async function loadBugs() {
  let entries;
  try {
    entries = await readdir(BUGS_DIR, { withFileTypes: true });
  } catch {
    return [];
  }
  const bugs = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const file = path.join(BUGS_DIR, entry.name, 'README.md');
    let text;
    try {
      text = await readFile(file, 'utf8');
    } catch {
      continue;
    }
    const data = parseFrontmatter(text);
    if (!data) {
      console.warn(`warning: no frontmatter in bugs/${entry.name}/README.md`);
      continue;
    }
    bugs.push({ dir: entry.name, file, data });
  }
  return bugs.sort((a, b) => a.dir.localeCompare(b.dir));
}

export function today() {
  // YYYY-MM-DD in the local time zone.
  return new Date().toLocaleDateString('sv-SE');
}
