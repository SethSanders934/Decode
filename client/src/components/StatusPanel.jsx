import { useState, useEffect } from 'react';

export default function StatusPanel() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  const check = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/status');
      const data = await res.json();
      setStatus(res.ok ? data : { server: 'error', groqKeySet: false, groqTest: 'error', groqError: data?.error || `HTTP ${res.status}` });
    } catch (e) {
      setStatus({ server: 'error', groqKeySet: false, groqTest: 'error', groqError: e?.message || 'Could not reach server' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { check(); }, []);

  if (loading && !status) {
    return (
      <div className="fixed bottom-4 right-4 rounded-lg border border-decode-cardBorder bg-decode-card p-3 shadow text-sm">
        Checking status…
      </div>
    );
  }

  const s = status || {};
  return (
    <div className="fixed bottom-4 right-4 rounded-lg border border-decode-cardBorder bg-decode-card p-3 shadow text-sm max-w-xs">
      <div className="font-semibold text-decode-article mb-2">Status</div>
      <ul className="space-y-1 text-decode-muted">
        <li>Server: {s.server === 'ok' ? <span className="text-green-600">OK</span> : <span className="text-red-600">Failed</span>}</li>
        <li>Groq key: {s.groqKeySet ? <span className="text-green-600">Set</span> : <span className="text-red-600">Not set</span>}</li>
        <li>Groq test: {s.groqTest === 'ok' ? <span className="text-green-600">OK</span> : s.groqTest === 'error' ? <span className="text-red-600">Error</span> : s.groqTest === 'unexpected' ? <span className="text-amber-600">Unexpected</span> : '—'}</li>
        {s.groqError && <li className="text-red-600 text-xs break-all">{s.groqError}</li>}
      </ul>
      <button type="button" onClick={check} className="mt-2 text-xs text-decode-accent hover:underline">Check again</button>
    </div>
  );
}
