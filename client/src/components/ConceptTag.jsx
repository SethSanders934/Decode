import { useState } from 'react';
import { getKnownConcepts } from '../utils/conceptTracker';

export default function ConceptTag({ name }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const concepts = getKnownConcepts();
  const meta = concepts[name];

  return (
    <span className="relative inline-block">
      <button
        type="button"
        onClick={() => setShowTooltip((s) => !s)}
        onBlur={() => setTimeout(() => setShowTooltip(false), 150)}
        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-decode-tagBg text-decode-tagText hover:bg-decode-accent hover:text-white transition-colors"
      >
        {name}
      </button>
      {showTooltip && meta && (
        <span
          className="absolute z-10 bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 text-xs bg-decode-article text-white rounded shadow-lg whitespace-nowrap"
          role="tooltip"
        >
          Seen in {meta.count} article{meta.count !== 1 ? 's' : ''} · first{' '}
          {meta.firstSeen}
        </span>
      )}
    </span>
  );
}
