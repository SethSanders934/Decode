/**
 * Segment raw article text into paragraphs (client-side fallback when URL fails).
 */
export function segmentIntoParagraphs(text) {
  if (!text || typeof text !== 'string') return [];
  const trimmed = text.trim();
  if (!trimmed) return [];

  const paragraphs = trimmed
    .split(/\n\n+/)
    .map((p) => p.trim().replace(/\s+/g, ' '))
    .filter((p) => p.length >= 20);

  return paragraphs.length ? paragraphs : [trimmed];
}
