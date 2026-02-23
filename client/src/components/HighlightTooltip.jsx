export default function HighlightTooltip({ position, text, onExplain, onDismiss }) {
  if (!position || !text) return null;

  return (
    <div
      className="absolute z-30 bg-decode-article text-white rounded-lg shadow-lg py-1.5 px-2"
      style={{
        top: position.top - 40,
        left: position.left,
      }}
    >
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onExplain();
          }}
          className="px-2 py-1 text-sm font-medium hover:bg-white/20 rounded"
        >
          Explain this
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
          className="p-1 hover:bg-white/20 rounded text-xs"
          aria-label="Close"
        >
          ×
        </button>
      </div>
    </div>
  );
}
