import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = p => fs.readFileSync(path.join(root, p));
const json = p => JSON.parse(read(p).toString('utf8').replace(/^\uFEFF/, ''));
const hash = p => createHash('sha256').update(read(p)).digest('hex');
function checkHashes(files, prefix = '') {
  for (const [file, expected] of Object.entries(files)) {
    const name = prefix + file.replaceAll('\\', '/');
    assert.equal(hash(name), expected, `SHA-256 mismatch: ${name}`);
  }
  return Object.keys(files).length;
}
const archive = json('SHA256SUMS.json');
const archiveCount = checkHashes(archive.files);
const frozenCount = checkHashes(json('docs/quest/evidence/final-export-manifest.json').files);
const earlierCount = checkHashes(json('docs/quest/evidence/q610-export-hashes.json'), 'docs/quest/evidence/');
const provenance = json('SUBMISSION_PROVENANCE.json');
for (const file of provenance.files) {
  assert.equal(hash(file.path), file.submissionSha256, `Provenance mismatch: ${file.path}`);
  if (file.transformation === 'byte-identical copy') assert.equal(file.originalSha256, file.submissionSha256);
}

function anchors(text, html) {
  const ids = new Set([...text.matchAll(/\bid=["']([^"']+)["']/g)].map(m => m[1]));
  if (!html) {
    const seen = new Map();
    for (const match of text.matchAll(/^#{1,6}\s+(.+)$/gm)) {
      const base = match[1].replace(/<[^>]*>/g, '').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
        .trim().toLowerCase().replace(/[^\p{L}\p{M}\p{N}_\-\s]/gu, '').replace(/\s/g, '-');
      const count = seen.get(base) || 0;
      ids.add(count ? `${base}-${count}` : base);
      seen.set(base, count + 1);
    }
  }
  return ids;
}
let links = 0;
let fragments = 0;
const failures = [];
for (const file of Object.keys(archive.files).filter(f => /\.(md|html)$/.test(f))) {
  const text = read(file).toString('utf8');
  const withoutCode = text.replace(/^```[^\n]*\n[\s\S]*?^```\s*$/gm, '');
  const urls = [
    ...[...withoutCode.matchAll(/!?\[[^\]\n]*\]\(([^\s)]+)\)/g)].map(m => m[1]),
    ...[...text.matchAll(/(?:href|src)=["']([^"']+)["']/g)].map(m => m[1]),
  ];
  for (const url of urls) {
    if (/^(?:[a-zA-Z][a-zA-Z0-9+.-]*:|\/\/)/.test(url)) continue;
    const [location, fragment] = url.split('#');
    const target = location ? path.resolve(root, path.dirname(file), decodeURIComponent(location.split('?')[0])) : path.join(root, file);
    const relative = path.relative(root, target);
    if (relative.startsWith('..') || !fs.existsSync(target)) { failures.push(`${file}: missing ${url}`); continue; }
    links++;
    if (fragment && /\.(md|html)$/.test(target)) {
      const ids = anchors(fs.readFileSync(target, 'utf8'), target.endsWith('.html'));
      if (!ids.has(decodeURIComponent(fragment))) failures.push(`${file}: missing anchor ${url}`);
      fragments++;
    }
  }
}
assert.equal(failures.length, 0, failures.join('\n'));

const cases = json('docs/quest/evidence/final-q606-case-manifest.json').cases;
const responses = json('docs/quest/evidence/final-v6-metrics.json').records;
const judgments = json('docs/quest/evidence/final-blind-review.json').records;
assert.equal(cases.length, 10);
assert.equal(responses.length, 20);
assert.equal(judgments.length, 20);
assert.equal(new Set(responses.map(r => r.traceId)).size, 20);
const labels = new Set(responses.map(r => r.label));
assert.equal(labels.size, 2);
for (const item of cases) {
  const pair = responses.filter(r => r.caseId === item.id);
  assert.equal(pair.length, 2, `Missing response pair: ${item.id}`);
  assert.equal(new Set(pair.map(r => r.label)).size, 2);
}
for (const row of responses) {
  const matches = judgments.filter(j => j.caseId === row.caseId && j.label === row.label && j.traceId === row.traceId);
  assert.equal(matches.length, 1, `Judgment join: ${row.traceId}`);
  assert.equal(matches[0].pass, row.pass);
  assert.equal(matches[0].critical, row.critical);
}
// Only observational metadata is published; no exported conversation body fields.
const forbidden = new Set(['question', 'answer', 'messages', 'generatedResult', 'request', 'response', 'prompt', 'completion']);
function checkMetadata(value, name) {
  if (Array.isArray(value)) return value.forEach(v => checkMetadata(v, name));
  if (value && typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) {
      assert(!forbidden.has(key), `Conversation body field in ${name}: ${key}`);
      checkMetadata(item, name);
    }
  }
}
for (const file of Object.keys(archive.files).filter(f => f.startsWith('docs/quest/evidence/') && f.endsWith('.json'))) {
  checkMetadata(json(file), file);
}
for (const file of Object.keys(archive.files)) {
  assert(!/(^|\/)\.env|(^|\/)(?:private|raw)\/|\.(?:key|pem|p12|pfx)$/i.test(file), `Private file in archive: ${file}`);
}
console.log(JSON.stringify({ result: 'PASS', archiveFiles: archiveCount, currentEvidenceManifestFiles: frozenCount,
  earlierEvidenceFiles: earlierCount, provenanceFiles: provenance.files.length, internalLinks: links,
  internalAnchors: fragments, cases: cases.length, responses: responses.length, judgments: judgments.length,
  modelCalls: 0, networkRequests: 0 }, null, 2));
