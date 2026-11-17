#!/usr/bin/env node
// Search WebKit or Mozilla Bugzilla, including closed bugs.
//
// Usage:
//   node scripts/search-bugzilla.mjs <webkit|mozilla> "<terms>" ["<terms>" ...] [--limit N] [--urls]
//
// Each quoted argument is one search (terms inside it are ANDed).
// Prints one JSON object per search. `limitReached: true` means there may be more matches,
// so record the count as "N+" rather than as a total.
// --urls prints only the request URLs (to read them another way when this process has no network).

import { TRACKERS, searchUrl, getJson, simplify } from './lib/bugzilla.mjs';

const args = process.argv.slice(2);
let limit = 50;
let urlsOnly = false;
const rest = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--limit') limit = Number(args[++i]);
  else if (args[i] === '--urls') urlsOnly = true;
  else rest.push(args[i]);
}
const [tracker, ...searches] = rest;

if (!TRACKERS[tracker] || searches.length === 0 || !(limit > 0)) {
  console.error('usage: node scripts/search-bugzilla.mjs <webkit|mozilla> "<terms>" ["<terms>" ...] [--limit N] [--urls]');
  process.exit(2);
}

let failed = false;
for (const terms of searches) {
  const url = searchUrl(tracker, terms, limit);
  if (urlsOnly) {
    console.log(url);
    continue;
  }
  try {
    const data = await getJson(url);
    const bugs = data.bugs.map((bug) => simplify(tracker, bug));
    console.log(JSON.stringify({
      tracker: TRACKERS[tracker].label,
      terms,
      url,
      count: bugs.length,
      limitReached: bugs.length >= limit,
      bugs,
    }, null, 2));
  } catch (error) {
    failed = true;
    console.error(`error: ${terms}: ${error.message}`);
  }
}
process.exitCode = failed ? 1 : 0;
