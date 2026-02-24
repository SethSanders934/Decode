function SettingsIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
}

export default function Header({ title, source, onBack, onSettingsClick, onDonationsClick, children }) {
  return (
    <header className="flex items-center justify-between gap-4 px-4 py-3 border-b border-decode-cardBorder bg-decode-card shrink-0 shadow-decode">
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
      <div className="flex items-center gap-2 shrink-0">
        {onDonationsClick && (
          <button
            type="button"
            onClick={onDonationsClick}
            className="text-sm text-decode-muted hover:text-decode-accent hover:underline"
          >
            Donations
          </button>
        )}
        {onSettingsClick && (
          <button
            type="button"
            onClick={onSettingsClick}
            className="p-2 rounded-decode-sm text-decode-muted hover:bg-decode-hover hover:text-decode-article transition-colors"
            aria-label="Settings"
          >
            <SettingsIcon />
          </button>
        )}
        {children}
      </div>
    </header>
  );
}
