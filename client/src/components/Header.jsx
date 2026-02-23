export default function Header({ title, source, onBack, children }) {
  return (
    <header className="flex items-center justify-between gap-4 px-4 py-3 border-b border-decode-cardBorder bg-decode-card shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="shrink-0 text-decode-accent hover:underline text-sm font-medium"
          >
            Back
          </button>
        )}
        <div className="min-w-0">
          <h1 className="text-sm font-semibold text-decode-article truncate">
            {title || 'Decode'}
          </h1>
          {source && (
            <p className="text-xs text-decode-muted truncate">{source}</p>
          )}
        </div>
      </div>
      {children}
    </header>
  );
}
