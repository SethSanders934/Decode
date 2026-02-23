import { useSettings, THEMES } from '../context/SettingsContext';

export default function SettingsPanel({ open, onClose }) {
  const { settings, setTheme, setFontSize, setLineSpacing, setBold, setDark } = useSettings();

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/30 z-40 transition-opacity"
        aria-hidden
        onClick={onClose}
      />
      <div
        className="fixed top-0 right-0 h-full w-full max-w-sm bg-decode-card border-l border-decode-cardBorder shadow-decode-lg z-50 flex flex-col animate-slide-in-right"
        role="dialog"
        aria-label="Settings"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-decode-cardBorder">
          <h2 className="text-lg font-semibold text-decode-article">Settings</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-decode-sm text-decode-muted hover:bg-decode-hover hover:text-decode-article transition-colors"
            aria-label="Close settings"
          >
            ×
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          {/* Theme */}
          <div>
            <label className="block text-sm font-medium text-decode-article mb-2">Theme</label>
            <div className="space-y-1.5">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTheme(t.id)}
                  className={`w-full text-left px-3 py-2 rounded-decode-sm border transition-colors ${
                    settings.theme === t.id
                      ? 'border-decode-accent bg-decode-highlight text-decode-article'
                      : 'border-decode-cardBorder bg-decode-bg text-decode-article hover:bg-decode-hover'
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          {/* Dark mode */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-decode-article">Dark mode</span>
            <button
              type="button"
              role="switch"
              aria-checked={settings.dark}
              onClick={() => setDark(!settings.dark)}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                settings.dark ? 'bg-decode-accent' : 'bg-decode-cardBorder'
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                  settings.dark ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Font size */}
          <div>
            <label className="block text-sm font-medium text-decode-article mb-2">Font size</label>
            <div className="flex gap-2">
              {['small', 'medium', 'large'].map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setFontSize(size)}
                  className={`flex-1 px-3 py-2 rounded-decode-sm border text-sm capitalize ${
                    settings.fontSize === size
                      ? 'border-decode-accent bg-decode-highlight text-decode-article'
                      : 'border-decode-cardBorder bg-decode-bg text-decode-muted hover:bg-decode-hover'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Bold text */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-decode-article">Bold text</span>
            <button
              type="button"
              role="switch"
              aria-checked={settings.bold}
              onClick={() => setBold(!settings.bold)}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                settings.bold ? 'bg-decode-accent' : 'bg-decode-cardBorder'
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                  settings.bold ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Line spacing */}
          <div>
            <label className="block text-sm font-medium text-decode-article mb-2">Line spacing</label>
            <div className="flex gap-2">
              {['compact', 'normal', 'relaxed'].map((spacing) => (
                <button
                  key={spacing}
                  type="button"
                  onClick={() => setLineSpacing(spacing)}
                  className={`flex-1 px-3 py-2 rounded-decode-sm border text-sm capitalize ${
                    settings.lineSpacing === spacing
                      ? 'border-decode-accent bg-decode-highlight text-decode-article'
                      : 'border-decode-cardBorder bg-decode-bg text-decode-muted hover:bg-decode-hover'
                  }`}
                >
                  {spacing}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
