#!/usr/bin/env node
// Fetch the current status of every Bugzilla bug linked from bugs/*/README.md (links.* keys).
// Links to other trackers (Chromium, GitHub) are listed as "manual" to check by hand.
//
// Usage: node scripts/bug-status.mjs [--urls]

import { loadBugs, ENGINES, splitLinks } from './lib/bugs.mjs';
import { idsUrl, getJson, parseBugLink, simplify } from './lib/bugzilla.mjs';

const urlsOnly = process.argv.includes('--urls');
const bugs = await loadBugs();

// tracker -> id -> [{ dir, engine }]
const wanted = {};
const manual = [];
for (const bug of bugs) {
  for (const engine of ENGINES) {
    for (const link of splitLinks(bug.data[`links.${engine}`])) {
      const parsed = parseBugLink(link);
      if (!parsed) {
        manual.push({ dir: bug.dir, engine, status: bug.data[`status.${engine}`], link });
        continue;
      }
      wanted[parsed.tracker] ??= {};
      (wanted[parsed.tracker][parsed.id] ??= []).push({ dir: bug.dir, engine, recorded: bug.data[`status.${engine}`] });
    }
  }
}

let failed = false;
const results = [];
for (const [tracker, byId] of Object.entries(wanted)) {
  const url = idsUrl(tracker, Object.keys(byId));
  if (urlsOnly) {
    console.log(url);
    continue;
  }
  try {
    const data = await getJson(url);
    for (const bug of data.bugs) {
      for (const ref of byId[bug.id] ?? []) results.push({ ...ref, ...simplify(tracker, bug) });
    }
  } catch (error) {
    failed = true;
    console.error(`error: ${tracker}: ${error.message}`);
  }
}

if (!urlsOnly) console.log(JSON.stringify({ bugzilla: results, manual }, null, 2));
process.exitCode = failed ? 1 : 0;
