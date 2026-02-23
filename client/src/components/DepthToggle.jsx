const LEVELS = [
  { id: 'eli5', label: 'ELI5' },
  { id: 'standard', label: 'Standard' },
  { id: 'technical', label: 'Technical' },
];

export default function DepthToggle({ value, onChange }) {
  return (
    <div className="flex rounded-lg border border-decode-cardBorder overflow-hidden bg-decode-bg">
      {LEVELS.map((level) => (
        <button
          key={level.id}
          type="button"
          onClick={() => onChange(level.id)}
          className={`px-3 py-1.5 text-sm font-medium transition-colors ${
            value === level.id
              ? 'bg-decode-accent text-white'
              : 'text-decode-muted hover:bg-decode-hover hover:text-decode-article'
          }`}
        >
          {level.label}
        </button>
      ))}
    </div>
  );
}
