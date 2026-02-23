import { useState, useCallback } from 'react';
import { segmentIntoParagraphs } from '../utils/articleParser';

export function useArticle() {
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadFromText = useCallback((text) => {
    setError(null);
    const paragraphs = segmentIntoParagraphs(text);
    setArticle({
      title: 'Pasted article',
      author: '',
      date: '',
      source: '',
      paragraphs,
      fullText: text.trim(),
    });
  }, []);

  const updateTitle = useCallback((title) => {
    setArticle((prev) => (prev ? { ...prev, title } : null));
  }, []);

  const loadFromSaved = useCallback((data) => {
    setError(null);
    setArticle({
      id: data.id,
      title: data.title,
      author: '',
      date: '',
      source: '',
      paragraphs: data.paragraphs,
      fullText: data.fullText || (data.paragraphs || []).join('\n\n'),
    });
  }, []);

  const clear = useCallback(() => {
    setArticle(null);
    setError(null);
  }, []);

  return { article, loading, error, loadFromText, loadFromSaved, updateTitle, clear };
}
