// Fill {{key}} placeholders in templates/ files.

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { ROOT } from './bugs.mjs';

// Returns the GitHub Pages base URL from package.json, or exits if it is still the placeholder.
export async function pagesBase() {
  const pkg = JSON.parse(await readFile(path.join(ROOT, 'package.json'), 'utf8'));
  const base = pkg.cssBugs?.pagesBase ?? '';
  if (!base || base.includes('OWNER')) {
    console.error('error: set cssBugs.pagesBase in package.json to the GitHub Pages URL first (it still contains OWNER)');
    process.exit(1);
  }
  return base;
}

export async function fillTemplate(name, values) {
  const template = await readFile(path.join(ROOT, 'templates', name), 'utf8');
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => values[key] ?? match);
}
