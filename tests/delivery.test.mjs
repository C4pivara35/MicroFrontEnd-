import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { recordSite } from '../scripts/record-site.mjs';
const initial = '# FitForge\n\n## Endereço publicado\n\nPendente.\n\n## Comece aqui\n\nInstruções.\n';
async function withReadme(run) { const dir = await mkdtemp(path.join(tmpdir(), 'fitforge-delivery-')); const readmePath = path.join(dir, 'README.md'); await writeFile(readmePath, initial); try { await run(readmePath); } finally { await rm(dir, { recursive: true, force: true }); } }
const validFetch = async url => new Response(url.includes('mfe-workouts') ? 'var fitforge_workouts;' : url.includes('mfe-progress') ? 'var fitforge_progress;' : '<html>FitForge</html>', { headers: { 'content-type': url.includes('remoteEntry') ? 'application/javascript' : 'text/html' } });
test('registers a real verified URL and preserves other README sections', () => withReadme(async readmePath => {
 const url = await recordSite({ url: 'https://sample.azurestaticapps.net/index.html#/workouts', readmePath, fetcher: validFetch });
 assert.equal(url, 'https://sample.azurestaticapps.net/'); const text = await readFile(readmePath, 'utf8'); assert.ok(text.includes('**Status: publicado.**')); assert.ok(text.includes(url)); assert.ok(text.endsWith('## Comece aqui\n\nInstruções.\n'));
}));
test('a 404 remote cannot produce a false published status', () => withReadme(async readmePath => {
 await assert.rejects(recordSite({ url: 'https://sample.azurestaticapps.net/', readmePath, fetcher: async url => url.includes('mfe-progress') ? new Response('Missing', { status: 404 }) : validFetch(url) }), /HTTP 404/);
 assert.equal(await readFile(readmePath, 'utf8'), initial);
}));
test('an HTML fallback instead of a remote is rejected without modifying the README', () => withReadme(async readmePath => {
 await assert.rejects(recordSite({ url: 'https://sample.azurestaticapps.net/', readmePath, fetcher: async url => url.includes('remoteEntry') ? new Response('<html>fitforge_workouts fitforge_progress</html>', { headers: { 'content-type': 'text/html' } }) : validFetch(url) }), /Conteúdo inválido/);
 assert.equal(await readFile(readmePath, 'utf8'), initial);
}));
test('non-HTTPS URL is rejected', () => withReadme(async readmePath => { await assert.rejects(recordSite({ url: 'http://localhost:5000/', readmePath, fetcher: validFetch }), /HTTPS/); }));
