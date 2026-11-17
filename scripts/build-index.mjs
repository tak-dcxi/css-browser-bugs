#!/usr/bin/env node
// Regenerate the bug list in README.md from the frontmatter of bugs/*/README.md.
// The list sits between the index:start and index:end comment markers.
//
// Usage: node scripts/build-index.mjs

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { ROOT, ENGINES, ENGINE_LABELS, STATUSES, loadBugs, splitLinks } from './lib/bugs.mjs';

const START = '<!-- index:start -->';
const END = '<!-- index:end -->';

const bugs = await loadBugs();
let problems = 0;

function cell(bug, engine) {
  const status = bug.data[`status.${engine}`] || '-';
  if (!STATUSES.includes(status)) {
    problems++;
    console.warn(`warning: bugs/${bug.dir}: unknown status.${engine} "${status}"`);
  }
  const links = splitLinks(bug.data[`links.${engine}`]).map((link, i) => `[${i + 1}](${link})`);
  return links.length ? `${status} ${links.join(' ')}` : status;
}

const escape = (text) => text.replace(/\|/g, '\\|');
const rows = bugs.map((bug) => {
  const title = escape(bug.data.title || bug.dir);
  return `| [${title}](bugs/${bug.dir}/) | ${ENGINES.map((engine) => cell(bug, engine)).join(' | ')} | ${bug.data.updated || ''} |`;
});

const table = [
  `| 件 | ${ENGINES.map((engine) => ENGINE_LABELS[engine]).join(' | ')} | 更新 |`,
  `|---|${ENGINES.map(() => '---').join('|')}|---|`,
  ...rows,
].join('\n');

const readmePath = path.join(ROOT, 'README.md');
const readme = await readFile(readmePath, 'utf8');
const start = readme.indexOf(START);
const end = readme.indexOf(END);
if (start < 0 || end < start) {
  console.error('error: index markers not found in README.md');
  process.exit(1);
}
const body = bugs.length ? table : 'まだありません。';
await writeFile(readmePath, `${readme.slice(0, start + START.length)}\n${body}\n${readme.slice(end)}`);
console.log(`index: ${bugs.length} bug(s)${problems ? `, ${problems} warning(s)` : ''}`);
process.exitCode = problems ? 1 : 0;
