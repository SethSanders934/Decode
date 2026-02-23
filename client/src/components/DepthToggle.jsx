import { useSettings } from '../context/SettingsContext';

const LEVELS = [
  { id: 'eli5', label: 'ELI5' },
  { id: 'standard', label: 'Standard' },
  { id: 'technical', label: 'Technical' },
];

export default function DepthToggle({ value, onChange }) {
  const { settings } = useSettings();
  const isTerminal = settings.theme === 'terminal';

  return (
    <div className={`flex border border-decode-cardBorder overflow-hidden bg-decode-bg ${isTerminal ? 'rounded-none' : 'rounded-decode'}`}>
      {LEVELS.map((level) => (
        <button
          key={level.id}
          type="button"
          onClick={() => onChange(level.id)}
          className={`px-3 py-1.5 text-sm font-medium transition-colors ${
            value === level.id
              ? isTerminal ? 'decode-cta-selected' : 'bg-decode-accent text-white'
              : isTerminal ? 'decode-cta text-decode-muted' : 'text-decode-muted hover:bg-decode-hover hover:text-decode-article'
          }`}
        >
          {level.label}
        </button>
      ))}
    </div>
  );
}
