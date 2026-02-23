export default function ParagraphBlock({
  index,
  text,
  isSelected,
  onToggle,
  selectionText,
  selectionPosition,
  onExplainHighlight,
  containerRef,
}) {
  return (
    <div
      onClick={() => {
        if (selectionText) return;
        onToggle(index);
      }}
      className={`
        article-body py-2 pl-10 pr-2 -mx-1 rounded transition-colors duration-200 cursor-pointer relative
        ${isSelected ? 'bg-decode-highlight border-l-4 border-decode-accent' : ''}
        hover:bg-decode-hover
      `}
    >
      <span
        className={`absolute left-2 top-3 w-5 h-5 rounded border-2 flex items-center justify-center text-xs ${
          isSelected ? 'bg-decode-accent border-decode-accent text-white' : 'border-decode-muted'
        }`}
        aria-hidden
      >
        {isSelected ? '✓' : ''}
      </span>
      <p>{text}</p>
    </div>
  );
}
