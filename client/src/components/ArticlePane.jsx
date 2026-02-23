import { useRef } from 'react';
import ParagraphBlock from './ParagraphBlock';
import HighlightTooltip from './HighlightTooltip';

export default function ArticlePane({
  title,
  source,
  date,
  paragraphs,
  selectedIndices,
  onToggleParagraph,
  onSelectAll,
  onClearSelection,
  selection,
  selectionPosition,
  onExplainHighlight,
  clearSelection,
  containerRef: externalRef,
}) {
  const internalRef = useRef(null);
  const containerRef = externalRef || internalRef;

  return (
    <div ref={containerRef} className="h-full overflow-y-auto">
      <div className="max-w-[680px] mx-auto px-8 md:px-12 py-8 relative">
        <h1 className="article-title mb-2">{title}</h1>
        {(source || date) && (
          <p className="text-sm text-decode-muted mb-6">
            {[source, date].filter(Boolean).join(' · ')}
          </p>
        )}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            type="button"
            onClick={onSelectAll}
            className="text-sm px-3 py-1.5 rounded border border-decode-cardBorder bg-decode-card text-decode-article hover:bg-decode-hover transition-colors"
          >
            Select all
          </button>
          {selectedIndices.size > 0 && (
            <button
              type="button"
              onClick={onClearSelection}
              className="text-sm px-3 py-1.5 rounded border border-decode-cardBorder bg-decode-card text-decode-article hover:bg-decode-hover transition-colors"
            >
              Clear selection
            </button>
          )}
        </div>
        <div className="space-y-4">
          {paragraphs.map((text, index) => (
            <div key={index} className={`group ${index === 0 ? 'article-body-first' : ''}`}>
              <ParagraphBlock
                index={index}
                text={text}
                isSelected={selectedIndices.has(index)}
                onToggle={onToggleParagraph}
                selectionText={selection?.text}
                selectionPosition={selection?.text ? selectionPosition : null}
                onExplainHighlight={onExplainHighlight}
                containerRef={containerRef}
              />
            </div>
          ))}
        </div>
        {selection?.text && selectionPosition && (
          <HighlightTooltip
            position={selectionPosition}
            text={selection.text}
            onExplain={() => onExplainHighlight(selection.text, '')}
            onDismiss={clearSelection}
          />
        )}
      </div>
    </div>
  );
}
