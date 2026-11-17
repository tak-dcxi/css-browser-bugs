// Read-only access to the public Bugzilla REST APIs of WebKit and Mozilla.

export const TRACKERS = {
  webkit: { label: 'WebKit Bugzilla', host: 'https://bugs.webkit.org' },
  mozilla: { label: 'Mozilla Bugzilla', host: 'https://bugzilla.mozilla.org' },
};

const FIELDS = 'id,summary,status,resolution,dupe_of,product,component,creation_time,last_change_time';

export function bugUrl(tracker, id) {
  return `${TRACKERS[tracker].host}/show_bug.cgi?id=${id}`;
}

// `ALL` makes quicksearch include closed bugs (RESOLVED, VERIFIED, ...).
// Without it, fixed and duplicate bugs are silently left out.
export function searchUrl(tracker, terms, limit) {
  const url = new URL('/rest/bug', TRACKERS[tracker].host);
  url.searchParams.set('quicksearch', `ALL ${terms}`);
  url.searchParams.set('include_fields', FIELDS);
  url.searchParams.set('limit', String(limit));
  return url.href;
}

export function idsUrl(tracker, ids) {
  const url = new URL('/rest/bug', TRACKERS[tracker].host);
  url.searchParams.set('id', ids.join(','));
  url.searchParams.set('include_fields', FIELDS);
  return url.href;
}

// bugs.webkit.org may put a non-JSON line before the JSON body, so parse from the first `{`.
export function parseBody(body) {
  const start = body.indexOf('{');
  if (start < 0) throw new Error(`no JSON in response: ${body.slice(0, 200)}`);
  try {
    return JSON.parse(body.slice(start));
  } catch (error) {
    throw new Error(`could not parse response as JSON (${error.message}): ${body.slice(0, 200)}`);
  }
}

export async function getJson(url) {
  const response = await fetch(url, { headers: { Accept: 'application/json' } });
  const body = await response.text();
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}: ${body.slice(0, 200)}`);
  const data = parseBody(body);
  if (data.error) throw new Error(`Bugzilla error for ${url}: ${data.message}`);
  return data;
}

export function simplify(tracker, bug) {
  return {
    id: bug.id,
    url: bugUrl(tracker, bug.id),
    status: bug.status,
    resolution: bug.resolution || '',
    ...(bug.dupe_of ? { dupeOf: bugUrl(tracker, bug.dupe_of) } : {}),
    product: bug.product,
    component: bug.component,
    created: bug.creation_time?.slice(0, 10),
    changed: bug.last_change_time?.slice(0, 10),
    summary: bug.summary,
  };
}

// Returns the tracker key and bug id for a Bugzilla bug URL, or null.
export function parseBugLink(link) {
  let url;
  try {
    url = new URL(link);
  } catch {
    return null;
  }
  const tracker = Object.keys(TRACKERS).find((key) => new URL(TRACKERS[key].host).host === url.host);
  if (!tracker) return null;
  const id = url.searchParams.get('id') ?? url.pathname.match(/^\/(\d+)$/)?.[1];
  return id && /^\d+$/.test(id) ? { tracker, id } : null;
}
