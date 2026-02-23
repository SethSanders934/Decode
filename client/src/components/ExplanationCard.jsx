import { useState } from 'react';
import ConceptTag from './ConceptTag';

export default function ExplanationCard({
  paragraphRef,
  explanation,
  concepts,
  isHighlight,
  quotedText,
  streaming,
  loading,
  selectionLabel,
}) {
  const [collapsed, setCollapsed] = useState(false);
  const isLong = explanation && explanation.length > 400;
  const showCollapse = isLong && !streaming;

  return (
    <div
      ref={paragraphRef}
      className="bg-decode-card border border-decode-cardBorder rounded-lg p-4 mb-4 shadow-sm transition-all duration-200"
    >
      {selectionLabel && (
        <p className="text-xs text-decode-muted mb-2">{selectionLabel}</p>
      )}
      {quotedText && (
        <p className="text-sm italic text-decode-muted mb-2 border-l-2 border-decode-accent pl-3">
          &ldquo;{quotedText}&rdquo;
        </p>
      )}
      {loading ? (
        <div className="flex items-center gap-2 text-decode-muted">
          <span className="inline-block w-4 h-4 border-2 border-decode-accent border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Generating explanation…</span>
        </div>
      ) : (
        <>
          <div
            className={`explanation-text ${collapsed ? 'line-clamp-4' : ''}`}
          >
            {explanation}
            {streaming && <span className="stream-cursor" />}
          </div>
          {showCollapse && (
            <button
              type="button"
              onClick={() => setCollapsed((c) => !c)}
              className="mt-2 text-sm text-decode-accent hover:underline"
            >
              {collapsed ? 'Show more' : 'Show less'}
            </button>
          )}
          {concepts && concepts.length > 0 && !streaming && (
            <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-decode-cardBorder">
              {concepts.map((c) => (
                <ConceptTag key={c} name={c} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
