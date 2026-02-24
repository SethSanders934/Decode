export default function AboutModal({ open, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
      <div
        className="bg-decode-card rounded-decode border border-decode-cardBorder shadow-decode-lg max-w-lg w-full max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 md:p-8">
          <h2 className="text-2xl font-bold text-decode-article mb-1 tracking-tight">About Decode</h2>
          <p className="text-xs text-decode-muted uppercase tracking-wider mb-6">Understand complex articles</p>

          <div className="space-y-5 text-decode-article">
            <p className="text-base leading-relaxed">
              <span className="font-semibold text-decode-accent">Decode</span> turns dense or technical articles into something you can actually follow. Paste any article text, open the side-by-side reader, and get clear explanations—at the level you choose—without leaving the page.
            </p>

            <div className="border-l-2 border-decode-accent pl-4 py-1">
              <p className="text-sm font-medium text-decode-muted mb-2">How it works</p>
              <ul className="text-sm space-y-1.5 text-decode-article">
                <li><strong>Paste</strong> your article into the box and hit Decode.</li>
                <li><strong>Select</strong> paragraphs (or highlight a phrase) you want explained.</li>
                <li>Pick a depth: <strong>ELI5</strong>, <strong>Standard</strong>, or <strong>Technical</strong>.</li>
                <li>Click <strong>Explain selected</strong> or <strong>Explain this</strong> and read the summary in the panel.</li>
              </ul>
            </div>

            <p className="text-sm text-decode-muted leading-relaxed">
              Not sure where to start? The <strong className="text-decode-article">Demo</strong> button runs a short walkthrough that shows exactly what Decode does—paste, select, and explain—so you can see it in action before trying your own article.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="mt-6 text-sm text-decode-accent hover:underline font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
