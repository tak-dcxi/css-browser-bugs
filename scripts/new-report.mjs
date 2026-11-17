#!/usr/bin/env node
// Create bugs/<slug>/report.<engine>.en.md from templates/report.en.md.
//
// Usage: node scripts/new-report.mjs <slug> <webkit|gecko|blink>

import { writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { BUGS_DIR, ENGINES } from './lib/bugs.mjs';
import { pagesBase, fillTemplate } from './lib/template.mjs';

const [slug, engine] = process.argv.slice(2);
if (!slug || !ENGINES.includes(engine)) {
  console.error(`usage: node scripts/new-report.mjs <slug> <${ENGINES.join('|')}>`);
  process.exit(2);
}

const dir = path.join(BUGS_DIR, slug);
if (!existsSync(dir)) {
  console.error(`error: bugs/${slug}/ does not exist`);
  process.exit(1);
}
const file = path.join(dir, `report.${engine}.en.md`);
if (existsSync(file)) {
  console.error(`error: bugs/${slug}/report.${engine}.en.md already exists`);
  process.exit(1);
}

await writeFile(file, await fillTemplate('report.en.md', { slug, pagesBase: await pagesBase() }));
console.log(`created bugs/${slug}/report.${engine}.en.md`);
