import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function History({ onOpenArticle }) {
  const { fetchWithAuth } = useAuth();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    fetchWithAuth('/api/articles')
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load history');
        return r.json();
      })
      .then((data) => {
        if (!cancelled) setArticles(data.articles || []);
      })
      .catch((e) => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [fetchWithAuth]);

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
    <ul className="space-y-2">
      {articles.map((a) => (
        <li key={a.id}>
          <button
            type="button"
            onClick={() => onOpenArticle(a.id)}
            className="w-full text-left px-4 py-3 rounded-lg border border-decode-cardBorder bg-decode-card hover:bg-decode-hover transition-colors"
          >
            <span className="font-medium text-decode-article block truncate">{a.title}</span>
            <span className="text-xs text-decode-muted">
              {a.explanation_count > 0 ? `${a.explanation_count} explanation${a.explanation_count !== 1 ? 's' : ''}` : 'No explanations'} · {new Date(a.created_at).toLocaleDateString()}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
