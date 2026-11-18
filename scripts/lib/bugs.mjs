// Shared helpers: repository paths, frontmatter parsing, and the status vocabulary.
// Frontmatter is flat `key: value` lines so it can be parsed without a YAML library.
// It must still be valid YAML for GitHub, so values that need it are double-quoted.

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

// Returns [key, raw value] pairs, or null when there is no frontmatter.
function frontmatterEntries(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!match) return null;
  const entries = [];
  for (const line of match[1].split(/\r?\n/)) {
    if (!line.trim() || line.trimStart().startsWith('#')) continue;
    const colon = line.indexOf(':');
    if (colon < 0) continue;
    entries.push([line.slice(0, colon).trim(), line.slice(colon + 1).trim()]);
  }
  return entries;
}

// GitHub renders the frontmatter as YAML and shows an error instead of the table when it
// does not parse. A plain value breaks YAML when it starts with an indicator character
// (`@`, `-`, `:`, quotes, ...), contains `: ` or ` #`, or ends with `:`.
export function needsQuotes(value) {
  return value !== '' && (/^[-?:,[\]{}#&*!|>'"%@`]/.test(value) || /: | #|:$/.test(value));
}

// Double-quoted JSON strings are valid YAML double-quoted scalars.
export function yamlScalar(value) {
  return needsQuotes(value) ? JSON.stringify(value) : value;
}

function unquote(raw) {
  if (raw.length >= 2 && raw.startsWith('"') && raw.endsWith('"')) {
    try {
      return JSON.parse(raw);
    } catch {
      return raw.slice(1, -1);
    }
  }
  if (raw.length >= 2 && raw.startsWith("'") && raw.endsWith("'")) {
    return raw.slice(1, -1).replaceAll("''", "'");
  }
  return raw;
}

export function parseFrontmatter(text) {
  const entries = frontmatterEntries(text);
  if (!entries) return null;
  return Object.fromEntries(entries.map(([key, raw]) => [key, unquote(raw)]));
}

// Keys whose value is written unquoted but needs quotes to be valid YAML.
export function unquotedUnsafeKeys(text) {
  return (frontmatterEntries(text) ?? [])
    .filter(([, raw]) => unquote(raw) === raw && needsQuotes(raw))
    .map(([key]) => key);
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
    for (const key of unquotedUnsafeKeys(text)) {
      console.warn(`warning: bugs/${entry.name}/README.md: quote the value of ${key} with "..." (it is not valid YAML as is)`);
    }
    bugs.push({ dir: entry.name, file, data });
  }
  return bugs.sort((a, b) => a.dir.localeCompare(b.dir));
}

export function today() {
  // YYYY-MM-DD in the local time zone.
  return new Date().toLocaleDateString('sv-SE');
}
