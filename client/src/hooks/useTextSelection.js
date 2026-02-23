import { useState, useCallback, useEffect } from 'react';

export function useTextSelection(containerRef) {
  const [selection, setSelection] = useState(null);
  const [position, setPosition] = useState(null);

  const clearSelection = useCallback(() => {
    setSelection(null);
    setPosition(null);
    if (typeof window !== 'undefined' && window.getSelection) {
      window.getSelection().removeAllRanges();
    }
  }, []);

  useEffect(() => {
    const el = containerRef?.current;
    if (!el) return;

    const handleSelectionChange = () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed) {
        setSelection(null);
        setPosition(null);
        return;
      }
      const range = sel.getRangeAt(0);
      if (!el.contains(range.commonAncestorContainer)) {
        setSelection(null);
        setPosition(null);
        return;
      }
      const text = sel.toString().trim();
      if (text.length < 3) {
        setSelection(null);
        setPosition(null);
        return;
      }
      const rect = range.getBoundingClientRect();
      const containerRect = el.getBoundingClientRect();
      setSelection({
        text,
        range,
      });
      setPosition({
        top: rect.top - containerRect.top + el.scrollTop - 40,
        left: rect.left - containerRect.left + rect.width / 2 - 60,
      });
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, [containerRef]);

  return { selection, position, clearSelection };
}
