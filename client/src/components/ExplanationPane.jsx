import { useSettings } from '../context/SettingsContext';
import ExplanationCard from './ExplanationCard';
import DepthToggle from './DepthToggle';

export default function ExplanationPane({
  explanations,
  loadingKeys,
  paragraphOrder,
  scrollToRef,
  depth,
  onDepthChange,
  requestExplanation,
  lastError,
  selectedCount,
  onExplainSelected,
}) {
  const isEmpty = paragraphOrder.length === 0;
  const showDebug = typeof window !== 'undefined' && window.location.search.includes('debug=1');
  const { settings } = useSettings();
  const isTerminal = settings.theme === 'terminal';

  return (
    <div className="flex flex-col h-full bg-decode-bg overflow-hidden">
      <div className="px-4 pt-4 pb-2 shrink-0 space-y-2">
        <DepthToggle value={depth} onChange={onDepthChange} />
        <p className="text-xs text-decode-muted">
          ELI5 = simpler language · Standard = balanced · Technical = more detail
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={onExplainSelected}
            disabled={selectedCount === 0}
            className={`px-4 py-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
              isTerminal ? 'decode-cta' : 'rounded-decode bg-decode-accent text-white hover:bg-decode-tagText'
            }`}
          >
            Explain selected {selectedCount > 0 ? `(${selectedCount})` : ''}
          </button>
        </div>
        {lastError && (
          <div className="text-xs p-2 rounded bg-amber-100 text-amber-900 border border-amber-300">
            <strong>Last API error:</strong> {lastError.status} — {lastError.detail || 'No details'}
          </div>
        )}
        {showDebug && (
          <div className="text-xs p-2 rounded bg-slate-200 text-slate-700">
            Debug on. Check browser console for request/response logs.
          </div>
        )}
      </div>
      <div className="flex-1 overflow-y-auto px-4 pb-8">
        {isEmpty ? (
          <p className="text-decode-muted text-sm leading-relaxed mt-6">
            Select paragraphs and click &ldquo;Explain selected&rdquo;.
          </p>
        ) : (
          <div className="mt-4">
            {paragraphOrder.map((key) => {
              const data = explanations[key];
              const loading = loadingKeys.has(key);
              const isGroup = key.startsWith('group-');
              const selectionLabel = isGroup ? 'Selected paragraphs' : null;
              return (
                <ExplanationCard
                  key={key}
                  paragraphRef={(el) => {
                    if (scrollToRef?.current) scrollToRef.current[key] = el;
                  }}
                  explanation={data?.explanation}
                  concepts={data?.concepts}
                  isHighlight={data?.isHighlight}
                  quotedText={data?.quotedText}
                  streaming={data?.streaming}
                  loading={loading && !data?.explanation}
                  selectionLabel={selectionLabel}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
