import { createContext, useContext, useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'decode_settings';
const DEFAULT = {
  theme: 'minimalist-ink',
  fontSize: 'medium',
  lineSpacing: 'normal',
  bold: false,
  dark: false,
};

function load() {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (s) return { ...DEFAULT, ...JSON.parse(s) };
  } catch (_) {}
  return { ...DEFAULT };
}

function save(settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (_) {}
}

function applyToDocument(settings) {
  const d = document.documentElement;
  d.dataset.theme = settings.theme || DEFAULT.theme;
  d.dataset.fontSize = settings.fontSize || DEFAULT.fontSize;
  d.dataset.lineSpacing = settings.lineSpacing || DEFAULT.lineSpacing;
  d.dataset.bold = settings.bold ? 'true' : 'false';
  d.dataset.dark = settings.dark ? 'true' : 'false';
}

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettingsState] = useState(load);

  useEffect(() => {
    applyToDocument(settings);
  }, [settings]);

  const setSettings = useCallback((next) => {
    setSettingsState((prev) => {
      const out = typeof next === 'function' ? next(prev) : { ...prev, ...next };
      save(out);
      return out;
    });
  }, []);

  const setTheme = useCallback((theme) => setSettings({ theme }), [setSettings]);
  const setFontSize = useCallback((fontSize) => setSettings({ fontSize }), [setSettings]);
  const setLineSpacing = useCallback((lineSpacing) => setSettings({ lineSpacing }), [setSettings]);
  const setBold = useCallback((bold) => setSettings({ bold }), [setSettings]);
  const setDark = useCallback((dark) => setSettings({ dark }), [setSettings]);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        setSettings,
        setTheme,
        setFontSize,
        setLineSpacing,
        setBold,
        setDark,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}

export const THEMES = [
  { id: 'minimalist-ink', name: 'Minimalist Ink' },
  { id: 'terminal', name: 'Terminal' },
  { id: 'typeset', name: 'Typeset' },
  { id: 'blueprint', name: 'Blueprint' },
  { id: 'midnight', name: 'Midnight' },
  { id: 'depths', name: 'Depths' },
  { id: 'nebula', name: 'Nebula' },
];
