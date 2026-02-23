import { useState, useCallback, useRef } from 'react';
import { getKnownConceptList } from '../utils/conceptTracker';
import { addConcepts } from '../utils/conceptTracker';

const API_BASE = '/api';
const DEBUG = typeof window !== 'undefined' && window.location.search.includes('debug=1');

/**
 * Parse streaming JSON: collect chunks and try to extract explanation + concepts.
 * Handles markdown code blocks and trailing commas.
 */
function parseStreamedJson(streamedText) {
  let raw = streamedText.trim();
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (jsonMatch) raw = jsonMatch[0];
  raw = raw.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
  try {
    return JSON.parse(raw);
  } catch (_) {
    try {
      return JSON.parse(raw.replace(/,(\s*[}\]])/g, '$1'));
    } catch (_) {
      return { explanation: streamedText, concepts: [] };
    }
  }
}

export function useExplanation() {
  const [explanations, setExplanations] = useState({});
  const [loadingKeys, setLoadingKeys] = useState(new Set());
  const [lastError, setLastError] = useState(null);
  const abortRef = useRef(null);

  const requestExplanation = useCallback(
    async ({ key, type, text, context, title, depth, isHighlight, onComplete }) => {
      const knownConcepts = getKnownConceptList();
      setLoadingKeys((prev) => new Set(prev).add(key));
      setLastError(null);

      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const body = {
        type: type || 'paragraph',
        text: text ?? '',
        context: context ?? '',
        title: title ?? 'Article',
        depth: depth || 'standard',
        knownConcepts,
      };
      if (DEBUG) console.log('[Decode] explain request', { key, textLen: body.text?.length, contextLen: body.context?.length });

      let streamed = '';
      try {
        const res = await fetch(`${API_BASE}/explain`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          signal: controller.signal,
        });

        if (DEBUG) console.log('[Decode] explain response', { status: res.status, ok: res.ok });

        if (!res.ok) {
          const rawErr = await res.text();
          let detail = rawErr;
          try {
            const j = JSON.parse(rawErr);
            detail = j.detail || j.error || rawErr;
          } catch (_) {}
          if (DEBUG) console.error('[Decode] explain error', res.status, detail);
          setLastError({ status: res.status, detail });
          throw new Error(detail || `Request failed (${res.status})`);
        }
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        const processChunk = (chunk) => {
          buffer += chunk;
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const payload = line.slice(6);
              if (payload === '[DONE]') return;
              try {
                const { chunk: c, error: e } = JSON.parse(payload);
                if (e) {
                  if (DEBUG) console.error('[Decode] SSE error', e);
                  setLastError({ status: 'stream', detail: e });
                  throw new Error(e);
                }
                if (c) streamed += c;
              } catch (_) {}
            }
          }
        };

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          processChunk(decoder.decode(value, { stream: true }));
          const parsed = parseStreamedJson(streamed);
          setExplanations((prev) => ({
            ...prev,
            [key]: {
              explanation: parsed.explanation || streamed,
              concepts: parsed.concepts || [],
              isHighlight: !!isHighlight,
              quotedText: isHighlight ? text : null,
              streaming: true,
            },
          }));
        }

        const parsed = parseStreamedJson(streamed);
        const explanation = parsed.explanation || streamed;
        const concepts = parsed.concepts || [];
        addConcepts(concepts);

        setExplanations((prev) => ({
          ...prev,
          [key]: {
            explanation,
            concepts,
            isHighlight: !!isHighlight,
            quotedText: isHighlight ? text : null,
            streaming: false,
          },
        }));
        if (onComplete) onComplete(key, { type, text, depth, explanation, concepts, isHighlight });
      } catch (err) {
        if (err.name === 'AbortError') return;
        setExplanations((prev) => ({
          ...prev,
          [key]: {
            explanation: `Error: ${err.message}`,
            concepts: [],
            isHighlight: !!isHighlight,
            quotedText: isHighlight ? text : null,
            streaming: false,
          },
        }));
        if (onComplete) onComplete(key, { type, text, depth, explanation: `Error: ${err.message}`, concepts: [], isHighlight: !!isHighlight });
      } finally {
        setLoadingKeys((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
        abortRef.current = null;
      }
    },
    []
  );

  const clearExplanations = useCallback(() => {
    setExplanations({});
    setLoadingKeys(new Set());
  }, []);

  const setInitialState = useCallback((explanationsObj, order) => {
    if (explanationsObj && typeof explanationsObj === 'object') setExplanations((prev) => ({ ...prev, ...explanationsObj }));
    // order is set by parent (paragraphOrder) when loading from history
  }, []);

  return {
    explanations,
    setExplanations,
    loadingKeys,
    requestExplanation,
    clearExplanations,
    setInitialState,
    lastError,
  };
}
