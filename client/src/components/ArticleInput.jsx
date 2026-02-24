import { useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import { DEMO_ARTICLE_TEXT } from '../constants/demoArticle';

function SettingsIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
}

export default function ArticleInput({ onDecode, loading, user, onLoginClick, onRegisterClick, onLogout, onHistoryClick, onSettingsClick, onDonationsClick }) {
  const [input, setInput] = useState('');
  const [error, setError] = useState(null);
  const { settings } = useSettings();
  const isTerminal = settings.theme === 'terminal';

  const handleSubmit = () => {
    const raw = input.trim();
    if (!raw) return;
    setError(null);
    onDecode({ type: 'text', value: raw });
  };

  const handleDemo = () => {
    setError(null);
    setInput(DEMO_ARTICLE_TEXT);
    onDecode({ type: 'text', value: DEMO_ARTICLE_TEXT, demo: true });
  };

  return (
    <>
      <div className="landing-bg" aria-hidden />
      <div className="min-h-screen flex flex-col items-center justify-start pt-16 px-4 relative">
        <div className="absolute top-4 right-4 flex items-center gap-3">
          {onDonationsClick && (
            <button
              type="button"
              onClick={onDonationsClick}
              className="text-sm text-decode-muted hover:text-decode-accent hover:underline"
            >
              Donations
            </button>
          )}
          {onSettingsClick && (
            <button
              type="button"
              onClick={onSettingsClick}
              className="p-2 rounded-decode-sm text-decode-muted hover:bg-decode-hover hover:text-decode-article transition-colors"
              aria-label="Settings"
            >
              <SettingsIcon />
            </button>
          )}
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
          <div className={`relative ${isTerminal ? 'decode-terminal-input' : ''}`}>
            {isTerminal && (
              <span className="absolute left-4 top-4 text-decode-article font-mono text-lg pointer-events-none" aria-hidden>
                &gt;
              </span>
            )}
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder={isTerminal ? 'Paste your article text here...' : 'Paste your article text here...'}
              className={`w-full min-h-[180px] py-4 border border-decode-input-border bg-decode-card text-decode-article placeholder-decode-muted focus:outline-none focus:ring-2 focus:ring-decode-accent focus:border-transparent resize-y transition-colors ${
                isTerminal ? 'pl-8 pr-4 rounded-none font-mono text-sm' : 'px-4 rounded-decode shadow-decode'
              }`}
              disabled={loading}
            />
          </div>
          {loading && (
            <p className="text-sm text-decode-muted mt-2">Loading…</p>
          )}
          {error && (
            <p className="text-sm text-red-600 mt-2">{error}</p>
          )}
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !input.trim()}
              className={`flex-1 py-3 px-4 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                isTerminal
                  ? 'rounded-none border border-decode-accent bg-transparent text-decode-accent hover:bg-decode-accent hover:text-decode-bg'
                  : 'bg-decode-accent text-white rounded-decode hover:bg-decode-accent-hover shadow-decode'
              }`}
            >
              Decode
            </button>
            <button
              type="button"
              onClick={handleDemo}
              disabled={loading}
              className="shrink-0 py-3 px-5 font-medium rounded-full border border-decode-cardBorder bg-decode-card text-decode-article hover:bg-decode-hover transition-colors"
            >
              Demo
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
