import { useState, useRef, useCallback, useEffect } from 'react';
import Header from './Header';
import ArticlePane from './ArticlePane';
import ExplanationPane from './ExplanationPane';
import { useArticle } from '../hooks/useArticle';
import { useExplanation } from '../hooks/useExplanation';
import { useTextSelection } from '../hooks/useTextSelection';
import { useLocalStorage } from '../hooks/useLocalStorage';

const DEPTH_KEY = 'decode_depth';

export default function ReaderLayout({
  article,
  onBack,
  updateTitle,
  fetchWithAuth,
  user,
  initialExplanations,
  initialParagraphOrder,
  isDemo,
  onSettingsClick,
}) {
  const [selectedIndices, setSelectedIndices] = useState(new Set());
  const [paragraphOrder, setParagraphOrder] = useState(initialParagraphOrder || []);
  const [currentArticleId, setCurrentArticleId] = useState(article?.id || null);
  const currentArticleIdRef = useRef(article?.id || null);
  const explanationScrollRef = useRef({});
  const articleContainerRef = useRef(null);
  const [depth, setDepth] = useLocalStorage(DEPTH_KEY, 'standard');
  const demoExplainTriggeredRef = useRef(false);
  const demoKeyRef = useRef(null);
  const depthRef = useRef(depth);
  const demoTimeoutsRef = useRef([]);
  const [demoTooltip, setDemoTooltip] = useState(null);
  const [showDemoSettingsTip, setShowDemoSettingsTip] = useState(false);

  depthRef.current = depth;

  const {
    explanations,
    setExplanations,
    loadingKeys,
    requestExplanation,
    lastError,
  } = useExplanation();

  useEffect(() => {
    if (initialParagraphOrder?.length && initialExplanations) {
      setParagraphOrder(initialParagraphOrder);
      setExplanations((prev) => ({ ...prev, ...initialExplanations }));
    }
  }, [initialParagraphOrder, initialExplanations, setExplanations]);

  // Create article as soon as we're in the reader (logged in, no id yet) so we have an id for explanations.
  // Use "Untitled" until suggest-title returns, then we'll PATCH the title.
  useEffect(() => {
    if (!article || !user || article.id) return;
    let cancelled = false;
    const titleToSave = article.title === 'Pasted article' ? 'Untitled' : article.title;
    fetchWithAuth('/api/articles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: titleToSave,
        fullText: article.fullText,
        paragraphs: article.paragraphs,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && data.id) {
          setCurrentArticleId(data.id);
          currentArticleIdRef.current = data.id;
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [article?.id, article?.fullText, article?.paragraphs, user, fetchWithAuth]);

  const { selection, position: selectionPosition, clearSelection } = useTextSelection(articleContainerRef);

  useEffect(() => {
    if (article?.id) {
      setCurrentArticleId(article.id);
      currentArticleIdRef.current = article.id;
    }
  }, [article?.id]);

  useEffect(() => {
    currentArticleIdRef.current = currentArticleId;
  }, [currentArticleId]);

  // Suggest title from Groq; when we get it, update local state and PATCH the saved article so history shows the named title.
  useEffect(() => {
    if (!article || article.title !== 'Pasted article' || !article.fullText) return;
    let cancelled = false;
    fetch('/api/suggest-title', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: article.fullText.slice(0, 4000) }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && data.title && updateTitle) updateTitle(data.title);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [article?.fullText, article?.title, updateTitle]);

  // When we have a suggested title and a saved article id, PATCH so history shows the named title.
  useEffect(() => {
    const id = currentArticleId;
    if (!article || !id || article.title === 'Pasted article' || article.title === 'Untitled') return;
    let cancelled = false;
    fetchWithAuth(`/api/articles/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: article.title }),
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [article?.title, currentArticleId, fetchWithAuth]);

  const toggleParagraph = useCallback((index) => {
    setSelectedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    if (!article?.paragraphs) return;
    setSelectedIndices(new Set(article.paragraphs.map((_, i) => i)));
  }, [article?.paragraphs]);

  const clearSelection_ = useCallback(() => {
    setSelectedIndices(new Set());
  }, []);

  const saveExplanation = useCallback(
    (articleId, type, selectionText, depth, explanation, concepts) => {
      if (!fetchWithAuth || !articleId || !explanation || explanation.startsWith('Error:')) return;
      fetchWithAuth('/api/explanations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleId,
          type,
          selectionText: selectionText || null,
          depth,
          explanation,
          concepts: concepts || [],
        }),
      }).catch(() => {});
    },
    [fetchWithAuth]
  );

  const handleExplainSelected = useCallback(() => {
    if (!article || selectedIndices.size === 0) return;
    const sorted = [...selectedIndices].sort((a, b) => a - b);
    const text = sorted.map((i) => article.paragraphs[i]).join('\n\n');
    const key = `group-${Date.now()}`;
    setParagraphOrder((prev) => [...prev, key]);
    requestExplanation({
      key,
      type: 'paragraph',
      text,
      context: article.fullText,
      title: article.title,
      depth,
      onComplete: (k, data) => {
        const aid = currentArticleIdRef.current;
        if (aid) saveExplanation(aid, 'paragraph', text, data.depth, data.explanation, data.concepts);
      },
    });
    setSelectedIndices(new Set());
    setTimeout(() => {
      const el = explanationScrollRef.current[key];
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
  }, [article, selectedIndices, depth, requestExplanation, saveExplanation]);

  const handleExplainHighlight = useCallback(
    (selectedText, _ignored) => {
      const key = `h-${Date.now()}`;
      const surrounding = article.paragraphs.find((p) => p.includes(selectedText)) || article.paragraphs[0] || '';
      setParagraphOrder((prev) => [...prev, key]);
      clearSelection();
      requestExplanation({
        key,
        type: 'highlight',
        text: selectedText,
        context: surrounding,
        title: article.title,
        depth,
        isHighlight: true,
        onComplete: (k, data) => {
          const aid = currentArticleIdRef.current;
          if (aid) saveExplanation(aid, 'highlight', selectedText, data.depth, data.explanation, data.concepts);
        },
      });
    },
    [article, depth, requestExplanation, clearSelection, saveExplanation]
  );

  // Demo mode: timed sequence — wait 1s, welcome 3s, select paragraphs (message 3s, select at 1s and 2s), then depth/explain, then theme tip 5s after "Getting..." is gone.
  useEffect(() => {
    if (!isDemo || !article?.paragraphs?.length) return;

    const ids = demoTimeoutsRef.current;
    ids.length = 0;
    const add = (id) => { ids.push(id); return id; };

    const runExplain = () => {
      if (demoExplainTriggeredRef.current) return;
      demoExplainTriggeredRef.current = true;
      const sorted = [0, 1];
      const text = sorted.map((i) => article.paragraphs[i]).join('\n\n');
      const key = `group-demo-${Date.now()}`;
      demoKeyRef.current = key;
      setParagraphOrder((prev) => [...prev, key]);
      requestExplanation({
        key,
        type: 'paragraph',
        text,
        context: article.fullText,
        title: article.title,
        depth: 'eli5',
        onComplete: (k, data) => {
          const aid = currentArticleIdRef.current;
          if (aid) saveExplanation(aid, 'paragraph', text, data.depth, data.explanation, data.concepts);
        },
      });
      setSelectedIndices(new Set());
      add(setTimeout(() => {
        const el = explanationScrollRef.current[key];
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 400));
    };

    // T=1s: show welcome for 3s
    add(setTimeout(() => setDemoTooltip('Welcome to the Decode side-by-side reader!'), 1000));
    // T=4s: welcome gone, show "Let's select the first two paragraphs" for 3s
    add(setTimeout(() => setDemoTooltip("Let's select the first two paragraphs"), 4000));
    // T=5s (1s after select message): select first paragraph
    add(setTimeout(() => setSelectedIndices(new Set([0])), 5000));
    // T=6s (2s after select message): select second paragraph
    add(setTimeout(() => setSelectedIndices(new Set([0, 1])), 6000));
    // T=7s: select message gone; branch on depth
    add(setTimeout(() => {
      const currentDepth = depthRef.current;
      const needEli5 = currentDepth === 'standard' || currentDepth === 'technical';

      if (needEli5) {
        setDemoTooltip("Let's keep it simple for now");
        setDepth('eli5');
        // 3s later: show "Getting your explanation...", run explain, hide after 2s, theme tip 5s after that
        add(setTimeout(() => {
          setDemoTooltip('Getting your explanation...');
          runExplain();
          add(setTimeout(() => {
            setDemoTooltip(null);
            add(setTimeout(() => setShowDemoSettingsTip(true), 5000));
          }, 2000));
        }, 3000));
      } else {
        setDemoTooltip('Getting your explanation...');
        runExplain();
        add(setTimeout(() => {
          setDemoTooltip(null);
          add(setTimeout(() => setShowDemoSettingsTip(true), 5000));
        }, 2000));
      }
    }, 7000));

    return () => { demoTimeoutsRef.current.forEach(clearTimeout); demoTimeoutsRef.current = []; };
  }, [isDemo, article, setDepth, requestExplanation, saveExplanation]);

  if (!article) return null;

  return (
    <div className="flex flex-col h-screen bg-decode-bg relative">
      {demoTooltip && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <div className="px-4 py-2 rounded-full bg-decode-article text-white text-sm shadow-decode-lg animate-fade-in">
            {demoTooltip}
          </div>
        </div>
      )}
      {showDemoSettingsTip && (
        <div className="fixed top-14 right-14 z-50 max-w-xs p-4 rounded-decode bg-decode-card border border-decode-cardBorder shadow-decode-lg animate-fade-in">
          <p className="text-sm text-decode-article font-medium mb-1">Don&apos;t like the look?</p>
          <p className="text-sm text-decode-muted">Don&apos;t worry, there are six other options! Open <strong>Settings</strong> (gear icon in the top right) to try different themes.</p>
          <button
            type="button"
            onClick={() => setShowDemoSettingsTip(false)}
            className="mt-3 text-xs text-decode-accent hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}
      <Header title={article.title} source={article.source} onBack={onBack} onSettingsClick={onSettingsClick} />
      <div className="flex-1 flex min-h-0 md:flex-row flex-col">
        <div className="md:w-[55%] w-full flex flex-col min-h-0 border-r border-decode-cardBorder">
          <ArticlePane
            containerRef={articleContainerRef}
            title={article.title}
            source={article.source}
            date={article.date}
            paragraphs={article.paragraphs}
            selectedIndices={selectedIndices}
            onToggleParagraph={toggleParagraph}
            onSelectAll={selectAll}
            onClearSelection={clearSelection_}
            selection={selection}
            selectionPosition={selectionPosition}
            onExplainHighlight={handleExplainHighlight}
            clearSelection={clearSelection}
          />
        </div>
        <div className="md:w-[45%] w-full flex flex-col min-h-0 md:max-h-none max-h-[60vh] md:border-t-0 border-t border-decode-cardBorder">
          <ExplanationPane
            explanations={explanations}
            loadingKeys={loadingKeys}
            paragraphOrder={paragraphOrder}
            scrollToRef={explanationScrollRef}
            depth={depth}
            onDepthChange={setDepth}
            requestExplanation={requestExplanation}
            lastError={lastError}
            selectedCount={selectedIndices.size}
            onExplainSelected={handleExplainSelected}
          />
        </div>
      </div>
    </div>
  );
}
