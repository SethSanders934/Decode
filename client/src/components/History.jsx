import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

export default function History({ onOpenArticle }) {
  const { fetchWithAuth } = useAuth();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [clearConfirm, setClearConfirm] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    fetchWithAuth('/api/articles')
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load history');
        return r.json();
      })
      .then((data) => setArticles(data.articles || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [fetchWithAuth]);

  useEffect(() => {
    let cancelled = false;
    load();
    return () => { cancelled = true; };
  }, [load]);

  const handleDelete = (e, id) => {
    e.stopPropagation();
    if (!id) return;
    setDeletingId(id);
    fetchWithAuth(`/api/articles/${id}`, { method: 'DELETE' })
      .then((r) => {
        if (r.ok) setArticles((prev) => prev.filter((a) => a.id !== id));
      })
      .finally(() => setDeletingId(null));
  };

  const handleClearAll = () => {
    if (!clearConfirm) {
      setClearConfirm(true);
      return;
    }
    fetchWithAuth('/api/articles/all', { method: 'DELETE' })
      .then((r) => {
        if (r.ok) {
          setArticles([]);
          setClearConfirm(false);
        }
      });
  };

  if (loading) return <p className="text-decode-muted text-sm">Loading history…</p>;
  if (error) return <p className="text-red-600 text-sm">{error}</p>;
  if (articles.length === 0) {
    return (
      <p className="text-decode-muted text-sm">
        No saved articles yet. Decode an article while logged in to see it here.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-2">
        {clearConfirm ? (
          <>
            <span className="text-sm text-decode-muted">Clear all history?</span>
            <button
              type="button"
              onClick={handleClearAll}
              className="text-sm px-3 py-1.5 rounded border border-red-500 text-red-600 hover:bg-red-50 transition-colors"
            >
              Yes, clear all
            </button>
            <button
              type="button"
              onClick={() => setClearConfirm(false)}
              className="text-sm text-decode-muted hover:underline"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setClearConfirm(true)}
            className="text-sm text-decode-muted hover:underline"
          >
            Clear all history
          </button>
        )}
      </div>
      <ul className="space-y-2">
        {articles.map((a) => (
          <li key={a.id}>
            <div className="flex items-center gap-2 w-full group">
              <button
                type="button"
                onClick={() => onOpenArticle(a.id)}
                className="flex-1 min-w-0 text-left px-4 py-3 rounded-lg border border-decode-cardBorder bg-decode-card hover:bg-decode-hover transition-colors"
              >
                <span className="font-medium text-decode-article block truncate">{a.title}</span>
                <span className="text-xs text-decode-muted">
                  {a.explanation_count > 0 ? `${a.explanation_count} explanation${a.explanation_count !== 1 ? 's' : ''}` : 'No explanations'} · {new Date(a.created_at).toLocaleDateString()}
                </span>
              </button>
              <button
                type="button"
                onClick={(e) => handleDelete(e, a.id)}
                disabled={deletingId === a.id}
                className="shrink-0 p-2 rounded border border-decode-cardBorder bg-decode-card text-decode-muted hover:text-red-600 hover:border-red-300 transition-colors disabled:opacity-50"
                aria-label="Delete article"
              >
                {deletingId === a.id ? '…' : '×'}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
