#!/usr/bin/env node
// Create bugs/<slug>/ with README.md and repro.html from templates/.
//
// Usage: node scripts/new-bug.mjs <slug> "<title in Japanese>"
// <slug> is short lowercase English with hyphens, e.g. text-wrap-pretty-cjk-balances.

import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { BUGS_DIR, today } from './lib/bugs.mjs';
import { pagesBase, fillTemplate } from './lib/template.mjs';

const [slug, title] = process.argv.slice(2);
if (!slug || !title || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
  console.error('usage: node scripts/new-bug.mjs <slug> "<title>"  (slug: lowercase letters, digits, hyphens)');
  process.exit(2);
}

const dir = path.join(BUGS_DIR, slug);
if (existsSync(dir)) {
  console.error(`error: bugs/${slug}/ already exists`);
  process.exit(1);
}

const values = { slug, title, date: today(), pagesBase: await pagesBase() };
await mkdir(dir, { recursive: true });
for (const name of ['README.md', 'repro.html']) {
  await writeFile(path.join(dir, name), await fillTemplate(name, values));
}
console.log(`created bugs/${slug}/README.md and bugs/${slug}/repro.html`);
