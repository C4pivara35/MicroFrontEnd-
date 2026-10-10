import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** Records only a reachable deployment with both real federation containers. */
export async function recordSite({ url, readmePath, fetcher = fetch }) {
  const base = new URL(url);
  if (base.protocol !== 'https:' || base.username || base.password) throw new Error('Informe a URL HTTPS pública do site publicado.');
  base.hash = ''; base.search = '';
  if (base.pathname.endsWith('/index.html')) base.pathname = base.pathname.slice(0, -10);
  if (!base.pathname.endsWith('/')) base.pathname += '/';
  const resources = [
    ['', 'FitForge', 'text/html'],
    ['mfe-workouts/remoteEntry.js', 'fitforge_workouts', null],
    ['mfe-progress/remoteEntry.js', 'fitforge_progress', null]
  ];
  for (const [resource, expected, mime] of resources) {
    const target = new URL(resource, base);
    const response = await fetcher(target.href, { signal: AbortSignal.timeout(20000), cache: 'no-store' });
    if (!response.ok) throw new Error(`O recurso ${target.pathname} retornou HTTP ${response.status}. O README não foi alterado.`);
    const type = response.headers.get('content-type') || '';
    const body = await response.text();
    if ((mime && !type.includes(mime)) || (!mime && !/(javascript|ecmascript)/i.test(type)) || !body.includes(expected) || (!mime && /<!doctype|<html/i.test(body))) {
      throw new Error(`Conteúdo inválido em ${target.pathname}. Confira o build e os MIME types. O README não foi alterado.`);
    }
  }
  const previous = await readFile(readmePath, 'utf8');
  const section = /## Endereço publicado\n[\s\S]*?(?=\n## )/;
  if (!section.test(previous)) throw new Error('Seção de endereço publicado não encontrada no README.');
  const content = `## Endereço publicado\n\n**Site:** [Abrir FitForge](${base.href})\n\n**Status: publicado.** Site e manifests dos dois microfrontends verificados em ${new Date().toISOString().slice(0, 10)}.\n`;
  await writeFile(readmePath, previous.replace(section, () => content));
  return base.href;
}
const invoked = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invoked) {
  const index = process.argv.indexOf('--url');
  const url = index < 0 ? process.env.SITE_URL : process.argv[index + 1];
  if (!url) { console.error('Uso: npm run site:registrar -- --url https://ENDERECO-REAL-DO-AZURE/'); process.exitCode = 1; }
  else {
    try {
      const readmePath = fileURLToPath(new URL('../README.md', import.meta.url));
      const verified = await recordSite({ url, readmePath });
      console.log(`URL verificada e registrada no README: ${verified}`);
    } catch (error) { console.error(error.message); process.exitCode = 1; }
  }
}
