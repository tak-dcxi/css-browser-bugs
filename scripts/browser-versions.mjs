#!/usr/bin/env node
// Print the installed browser versions (macOS) as Markdown table rows for a bug README.
// Browsers that are not installed are skipped.
//
// Usage: node scripts/browser-versions.mjs

import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';

const APPS = [
  { name: 'Safari', engine: 'WebKit', app: '/Applications/Safari.app', build: true },
  { name: 'Safari Technology Preview', engine: 'WebKit', app: '/Applications/Safari Technology Preview.app', build: true },
  { name: 'Firefox', engine: 'Gecko', app: '/Applications/Firefox.app' },
  { name: 'Firefox Nightly', engine: 'Gecko', app: '/Applications/Firefox Nightly.app' },
  { name: 'Google Chrome', engine: 'Blink', app: '/Applications/Google Chrome.app' },
  { name: 'Google Chrome Canary', engine: 'Blink', app: '/Applications/Google Chrome Canary.app' },
];

function plistValue(app, key) {
  try {
    return execFileSync('plutil', ['-extract', key, 'raw', '-o', '-', `${app}/Contents/Info.plist`], { encoding: 'utf8' }).trim();
  } catch {
    return '';
  }
}

const macos = execFileSync('sw_vers', ['-productVersion'], { encoding: 'utf8' }).trim();
console.log(`OS: macOS ${macos}\n`);
console.log('| ブラウザ | エンジン | バージョン |');
console.log('|---|---|---|');
for (const { name, engine, app, build } of APPS) {
  if (!existsSync(app)) continue;
  const version = plistValue(app, 'CFBundleShortVersionString');
  const bundle = build ? plistValue(app, 'CFBundleVersion') : '';
  console.log(`| ${name} | ${engine} | ${version}${bundle ? ` (${bundle})` : ''} |`);
}
