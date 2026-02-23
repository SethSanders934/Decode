import { useState } from 'react';

export default function ArticleInput({ onDecode, loading, user, onLoginClick, onRegisterClick, onLogout, onHistoryClick }) {
  const [input, setInput] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = () => {
    const raw = input.trim();
    if (!raw) return;
    setError(null);
    onDecode({ type: 'text', value: raw });
  };

  return (
    <>
      <div className="landing-bg" aria-hidden />
      <div className="min-h-screen flex flex-col items-center justify-start pt-16 px-4 relative">
        <div className="absolute top-4 right-4 flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm text-decode-muted truncate max-w-[140px]">{user.email}</span>
              <button type="button" onClick={onHistoryClick} className="text-sm text-decode-accent hover:underline">
                History
              </button>
              <button type="button" onClick={onLogout} className="text-sm text-decode-muted hover:underline">
                Log out
              </button>
            </>
          ) : (
            <>
              <button type="button" onClick={onLoginClick} className="text-sm text-decode-accent hover:underline">
                Log in
              </button>
              <button type="button" onClick={onRegisterClick} className="text-sm text-decode-muted hover:underline">
                Register
              </button>
            </>
          )}
        </div>
        <h1 className="text-4xl font-serif font-bold text-decode-article mb-10">
          Decode
        </h1>
        <div className="w-full max-w-2xl">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="Paste your article text here..."
            className="w-full min-h-[180px] px-4 py-4 rounded-xl border border-decode-cardBorder bg-white/90 backdrop-blur-sm text-decode-article placeholder-decode-muted focus:outline-none focus:ring-2 focus:ring-decode-accent focus:border-transparent resize-y shadow-sm"
            disabled={loading}
          />
          {loading && (
            <p className="text-sm text-decode-muted mt-2">Loading…</p>
          )}
          {error && (
            <p className="text-sm text-red-600 mt-2">{error}</p>
          )}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !input.trim()}
            className="mt-4 w-full py-3 px-4 bg-decode-accent text-white font-medium rounded-xl hover:bg-decode-tagText disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            Decode
          </button>
        </div>
      </div>
    </>
  );
}
