import { readFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const root = new URL('../', import.meta.url);
let failed = false;
const result = (ok, label) => { console.log(`${ok ? 'OK' : 'PENDENTE'}: ${label}`); if (!ok) failed = true; };
const readme = await readFile(new URL('README.md', root), 'utf8');
const group = await readFile(new URL('GRUPO.md', root), 'utf8');
result(/^\s*-\s+\S.+$/m.test(group), 'GRUPO.md contém ao menos um integrante (confira os demais nomes manualmente)');
for (const app of ['shell', 'workouts', 'progress']) {
  const config = await readFile(new URL(`apps/${app}/webpack.config.cjs`, root), 'utf8');
  result(config.includes('webpack.common.cjs'), `Configuração federada: ${app}`);
}
for (const file of ['dist/index.html', 'dist/mfe-workouts/remoteEntry.js', 'dist/mfe-progress/remoteEntry.js']) {
  try { await access(new URL(file, root)); result(true, `Build presente: ${file}`); } catch { result(false, `Build ausente: ${file}`); }
}
const match = readme.match(/\*\*Site:\*\* \[Abrir FitForge\]\((https:\/\/[^\s)]+)\)/);
result(Boolean(match), 'URL pública registrada no README');
if (match) {
  const { recordSite } = await import('./record-site.mjs');
  try { await recordSite({ url: match[1], readmePath: fileURLToPath(new URL('README.md', root)) }); result(true, 'Site e dois manifests remotos respondem corretamente'); }
  catch (error) { result(false, error.message); }
}
console.log('Confirme que a URL usa o recurso Azure solicitado e que todos os alunos estão identificados.');
process.exitCode = failed ? 1 : 0;
