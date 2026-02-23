const STORAGE_KEY = 'decode_concepts';

export function getKnownConcepts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function getKnownConceptList() {
  return Object.keys(getKnownConcepts());
}

export function addConcepts(concepts) {
  if (!Array.isArray(concepts) || concepts.length === 0) return;
  const known = getKnownConcepts();
  const now = new Date().toISOString().slice(0, 10);
  for (const name of concepts) {
    const key = name.trim();
    if (!key) continue;
    if (known[key]) {
      known[key].count += 1;
      known[key].lastSeen = now;
    } else {
      known[key] = { count: 1, firstSeen: now, lastSeen: now };
    }
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(known));
  } catch (_) {}
}
