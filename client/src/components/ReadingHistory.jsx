const STORAGE_KEY = 'decode_history';
const MAX_ITEMS = 12;

export function getReadingHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function addToReadingHistory(entry) {
  const list = getReadingHistory();
  const filtered = list.filter((e) => e.id !== entry.id);
  const next = [{ ...entry, decodedAt: new Date().toISOString() }, ...filtered].slice(0, MAX_ITEMS);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch (_) {}
}

export default function ReadingHistory({ history, onSelect }) {
  if (!history?.length) return null;

  return (
    <div className="mt-12 max-w-2xl mx-auto">
      <h2 className="text-sm font-medium text-decode-muted mb-3">Recently decoded</h2>
      <ul className="space-y-2">
        {history.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => onSelect(item)}
              className="w-full text-left px-4 py-3 rounded-lg border border-decode-cardBorder bg-decode-card hover:bg-decode-hover transition-colors"
            >
              <span className="font-medium text-decode-article block truncate">
                {item.title}
              </span>
              <span className="text-xs text-decode-muted">
                {item.source}
                {item.decodedAt && (
                  <> · {new Date(item.decodedAt).toLocaleDateString()}</>
                )}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
