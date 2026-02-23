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
  onSettingsClick,
}) {
  const [selectedIndices, setSelectedIndices] = useState(new Set());
  const [paragraphOrder, setParagraphOrder] = useState(initialParagraphOrder || []);
  const [currentArticleId, setCurrentArticleId] = useState(article?.id || null);
  const currentArticleIdRef = useRef(article?.id || null);
  const explanationScrollRef = useRef({});
  const articleContainerRef = useRef(null);
  const [depth, setDepth] = useLocalStorage(DEPTH_KEY, 'standard');

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

  useEffect(() => {
    if (!article || !user || article.id || article.title === 'Pasted article') return;
    let cancelled = false;
    fetchWithAuth('/api/articles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: article.title,
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
  }, [article?.title, article?.fullText, user, fetchWithAuth]);

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

  if (!article) return null;

  return (
    <div className="flex flex-col h-screen bg-decode-bg">
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
