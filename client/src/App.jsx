import { useState, useCallback } from 'react';
import ArticleInput from './components/ArticleInput';
import ReaderLayout from './components/ReaderLayout';
import History from './components/History';
import AuthModal from './components/AuthModal';
import SettingsPanel from './components/SettingsPanel';
import { useArticle } from './hooks/useArticle';
import { useAuth } from './context/AuthContext';

export default function App() {
  const { article, loading, loadFromText, loadFromSaved, updateTitle, clear } = useArticle();
  const { user, fetchWithAuth, login, register, logout } = useAuth();
  const [view, setView] = useState('input');
  const [authMode, setAuthMode] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [initialReaderState, setInitialReaderState] = useState(null);

  const handleDecode = useCallback(
    ({ type, value }) => {
      if (type === 'text') {
        loadFromText(value);
        setView('reader');
        setInitialReaderState(null);
      }
    },
    [loadFromText]
  );

  const handleBack = useCallback(() => {
    clear();
    setView('input');
    setInitialReaderState(null);
  }, [clear]);

  const handleOpenFromHistory = useCallback(
    (articleId) => {
      fetchWithAuth(`/api/articles/${articleId}`)
        .then((r) => {
          if (!r.ok) throw new Error('Failed to load article');
          return r.json();
        })
        .then((data) => {
          loadFromSaved({
            id: data.id,
            title: data.title,
            paragraphs: data.paragraphs,
            fullText: data.fullText,
          });
          const explanations = data.explanations || [];
          const order = explanations.map((_, i) => `saved-${i}`);
          const initialExplanations = {};
          explanations.forEach((e, i) => {
            initialExplanations[`saved-${i}`] = {
              explanation: e.explanation,
              concepts: e.concepts || [],
              isHighlight: e.type === 'highlight',
              quotedText: e.type === 'highlight' ? e.selectionText : null,
              streaming: false,
            };
          });
          setInitialReaderState({ initialExplanations, initialParagraphOrder: order });
          setView('reader');
        })
        .catch(() => {});
    },
    [fetchWithAuth, loadFromSaved]
  );

  return (
    <>
      {view === 'input' && (
        <ArticleInput
          onDecode={handleDecode}
          loading={loading}
          user={user}
          onLoginClick={() => setAuthMode('login')}
          onRegisterClick={() => setAuthMode('register')}
          onLogout={logout}
          onHistoryClick={() => setView('history')}
          onSettingsClick={() => setSettingsOpen(true)}
        />
      )}
      {view === 'history' && (
        <div className="min-h-screen bg-decode-bg flex flex-col items-center pt-16 px-4">
          <div className="w-full max-w-2xl">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-xl font-semibold text-decode-article">Article history</h1>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSettingsOpen(true)}
                  className="p-2 rounded-decode-sm text-decode-muted hover:bg-decode-hover hover:text-decode-article transition-colors"
                  aria-label="Settings"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
                </button>
                <button
                  type="button"
                  onClick={() => setView('input')}
                  className="text-sm text-decode-accent hover:underline"
                >
                  Back
                </button>
              </div>
            </div>
            <History onOpenArticle={handleOpenFromHistory} />
          </div>
        </div>
      )}
      {view === 'reader' && article && (
        <ReaderLayout
          article={article}
          onBack={handleBack}
          updateTitle={updateTitle}
          fetchWithAuth={fetchWithAuth}
          user={user}
          initialExplanations={initialReaderState?.initialExplanations}
          initialParagraphOrder={initialReaderState?.initialParagraphOrder}
          onSettingsClick={() => setSettingsOpen(true)}
        />
      )}
      {authMode && (
        <AuthModal
          mode={authMode}
          onClose={() => setAuthMode(null)}
          onLogin={login}
          onRegister={register}
        />
      )}
      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}
