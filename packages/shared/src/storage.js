/** Per-domain repository. Writes are atomic: listeners see only persisted data. */
export function createRepository({ key, seed = [], validate, event, storage = () => window.localStorage }) {
  const read = () => {
    let raw;
    try { raw = storage().getItem(key); } catch { throw new Error('O navegador bloqueou o armazenamento local. Permita-o para salvar seus dados.'); }
    if (raw === null) return structuredClone(seed);
    try {
      const data = JSON.parse(raw);
      if (data.version !== 1 || !Array.isArray(data.items) || !data.items.every(validate)) throw new Error();
      const ids = data.items.map(item => item.id);
      if (new Set(ids).size !== ids.length) throw new Error();
      return data.items;
    } catch { throw new Error('Os dados salvos estão em formato inválido. Exporte ou revise o armazenamento pelo navegador antes de continuar. Seus dados não foram sobrescritos.'); }
  };
  const write = items => {
    if (!items.every(validate)) throw new Error('Dados inválidos. Revise os campos antes de salvar.');
    try { storage().setItem(key, JSON.stringify({ version: 1, items })); }
    catch { throw new Error('Não foi possível salvar. O armazenamento está bloqueado ou sem espaço.'); }
    if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent(event));
    return items;
  };
  return { read, save(item) { const items = read(); const index = items.findIndex(row => row.id === item.id); if (index < 0) items.unshift(item); else items[index] = item; return write(items); }, remove(id) { return write(read().filter(row => row.id !== id)); } };
}
