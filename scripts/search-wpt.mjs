#!/usr/bin/env node
// Search web-platform-tests results on wpt.fyi through its JSON API.
//
// Usage:
//   node scripts/search-wpt.mjs "<query>" ["<query>" ...] [--channel stable|experimental|both] [--urls]
//
// Each quoted argument is one search: wpt.fyi matches it against test paths
// (for example "text-decoration-inset" or "css-text/white-space").
// Prints one JSON object per search and channel. `results` maps each browser to
// "passed/total" subtests, or to the test status when the test has no subtests (reftests).
// The default channel is both: stable releases, and the experimental builds
// (Chrome Canary, Firefox Nightly, Safari Technology Preview).
// The results page of wpt.fyi renders with JavaScript, so reading it as page text returns nothing.
// --urls prints only the request URLs (to read them another way when this process has no network).

const HOST = 'https://wpt.fyi';
const PRODUCTS = ['chrome', 'firefox', 'safari'];
const CHANNELS = ['stable', 'experimental'];
// Status letters of legacy_status, used when a test has no subtests.
const STATUS = { O: 'OK', P: 'PASS', F: 'FAIL', T: 'TIMEOUT', E: 'ERROR', C: 'CRASH', N: 'NOTRUN', '': 'missing' };

const args = process.argv.slice(2);
let channels = CHANNELS;
let urlsOnly = false;
const queries = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--channel') {
    const value = args[++i];
    channels = value === 'both' ? CHANNELS : [value];
  } else if (args[i] === '--urls') urlsOnly = true;
  else queries.push(args[i]);
}

if (queries.length === 0 || !channels.every((channel) => CHANNELS.includes(channel))) {
  console.error('usage: node scripts/search-wpt.mjs "<query>" ["<query>" ...] [--channel stable|experimental|both] [--urls]');
  process.exit(2);
}

// `aligned` picks the latest revision that every product ran, so the results are comparable.
function runsUrl(channel) {
  const url = new URL('/api/runs', HOST);
  url.searchParams.append('label', 'master');
  url.searchParams.append('label', channel);
  url.searchParams.set('aligned', 'true');
  url.searchParams.set('max-count', '1');
  for (const product of PRODUCTS) url.searchParams.append('product', product);
  return url.href;
}

// /api/search ignores label filters, so the runs are chosen first and passed by id.
function searchUrl(runs, query) {
  const url = new URL('/api/search', HOST);
  url.searchParams.set('run_ids', runs.map((run) => run.id).join(','));
  url.searchParams.set('q', query);
  return url.href;
}

function pageUrl(channel, query) {
  const url = new URL('/results/', HOST);
  url.searchParams.append('label', 'master');
  url.searchParams.append('label', channel);
  url.searchParams.set('aligned', '');
  url.searchParams.set('q', query);
  return url.href;
}

async function getJson(url) {
  const response = await fetch(url, { headers: { Accept: 'application/json' } });
  const body = await response.text();
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}: ${body.slice(0, 200)}`);
  return JSON.parse(body);
}

function formatStatus(status) {
  if (status.total > 0) return `${status.passes}/${status.total}`;
  return STATUS[status.status] ?? status.status;
}

let failed = false;
for (const channel of channels) {
  if (urlsOnly) {
    console.log(runsUrl(channel));
    console.log(`${HOST}/api/search?run_ids=<ids from the runs above>&q=<query>`);
    continue;
  }
  let runs;
  try {
    runs = await getJson(runsUrl(channel));
  } catch (error) {
    failed = true;
    console.error(`error: runs for ${channel}: ${error.message}`);
    continue;
  }
  for (const query of queries) {
    try {
      const data = await getJson(searchUrl(runs, query));
      const browsers = data.runs.map((run) => run.browser_name);
      console.log(JSON.stringify({
        query,
        channel,
        page: pageUrl(channel, query),
        runs: data.runs.map((run) => ({
          browser: run.browser_name,
          version: run.browser_version,
          revision: run.revision,
          date: run.time_start?.slice(0, 10),
        })),
        count: data.results.length,
        tests: data.results.map((result) => ({
          test: result.test,
          url: `${HOST}/results${result.test}?label=master&label=${channel}&aligned`,
          results: Object.fromEntries(result.legacy_status.map((status, i) => [browsers[i], formatStatus(status)])),
        })),
      }, null, 2));
    } catch (error) {
      failed = true;
      console.error(`error: ${query} (${channel}): ${error.message}`);
    }
  }
}
process.exitCode = failed ? 1 : 0;
