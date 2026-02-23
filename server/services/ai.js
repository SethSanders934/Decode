import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Groq from 'groq-sdk';

const __dirname = dirname(fileURLToPath(import.meta.url));
// Load .env from project root or server directory
dotenv.config({ path: join(__dirname, '../..', '.env') });
dotenv.config({ path: join(__dirname, '..', '.env') });

const apiKey = process.env.GROQ_API_KEY;
const groq = apiKey ? new Groq({ apiKey }) : null;

function requireGroq() {
  if (!groq) throw new Error('GROQ_API_KEY is missing. Add it to a file named .env in the server folder (or project root) with a line: GROQ_API_KEY=your_key_here');
}

/** Call from GET /api/debug/groq to verify API key and connectivity. */
export async function testGroqConnection() {
  requireGroq();
  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages: [{ role: 'user', content: 'Reply with exactly: OK' }],
    max_tokens: 10,
    temperature: 0,
  });
  const text = completion.choices[0]?.message?.content?.trim() || '';
  return { ok: text.toUpperCase().includes('OK'), response: text };
}

/** Suggest a short title for pasted article text (max ~10 words). */
export async function suggestTitle(text) {
  requireGroq();
  const excerpt = (text || '').slice(0, 3000);
  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: 'user',
        content: `Suggest a short, accurate title for this article (max 10 words). Reply with only the title, no quotes or punctuation.\n\n${excerpt}`,
      },
    ],
    max_tokens: 20,
    temperature: 0.3,
  });
  const title = completion.choices[0]?.message?.content?.trim() || '';
  return title.slice(0, 120) || null;
}

const MODEL = 'llama-3.3-70b-versatile';

const DEPTH_INSTRUCTIONS = {
  eli5:
    'Use analogies heavily. Assume smart high school student. Keep it under 100 words per paragraph explanation.',
  standard:
    'Assume undergraduate level. Define technical terms but do not over-simplify. 100-200 words per paragraph.',
  technical:
    'Assume graduate-level familiarity. Focus on methodology, significance, and implications. Can be longer if needed.',
};

function buildSystemPrompt(depth, knownConcepts, title, fullText) {
  const depthText = DEPTH_INSTRUCTIONS[depth] || DEPTH_INSTRUCTIONS.standard;
  const conceptsText =
    knownConcepts.length > 0
      ? `The reader has previously encountered these concepts (do not re-explain these from scratch, assume familiarity): ${knownConcepts.join(', ')}`
      : 'The reader has no prior concept history.';
  return `You are an expert science communicator. Your job is to explain complex articles to a curious, intelligent reader. You are NOT a chatbot — you are an annotation engine. Your explanations should be:

1. Anchored to the specific text you're given — don't generalize, explain THIS paragraph
2. Concise but complete — cover everything the reader needs to understand the paragraph, nothing more
3. Jargon-aware — when a technical term appears, define it inline naturally (don't make a glossary, weave definitions into your explanation)
4. Connective — when relevant, briefly note how this paragraph connects to the broader argument of the article

The reader's depth preference is: ${depth}
${depthText}

${conceptsText}

ARTICLE TITLE: ${title}
FULL ARTICLE CONTEXT: ${fullText}`;
}

function buildParagraphPrompt(paragraphText) {
  return `Now explain ONLY this specific paragraph:
"${paragraphText}"

Respond with a JSON object only, no other text:
{
  "explanation": "Your explanation text here...",
  "concepts": ["concept1", "concept2", "concept3"]
}

The "concepts" array should list 2-5 key technical or scientific terms from this paragraph that a non-expert might need to learn. Only include genuinely technical terms, not common words.`;
}

function buildHighlightPrompt(selectedText, surroundingParagraph) {
  return `The reader has highlighted this specific text and wants it explained:
"${selectedText}"

This text appears in the context of this paragraph:
"${surroundingParagraph}"

Give a brief, focused explanation of just the highlighted portion. Be concise — this is a quick clarification, not a full paragraph breakdown. Aim for 50-100 words.

Respond with a JSON object only, no other text:
{
  "explanation": "Your explanation text here...",
  "concepts": ["concept1"]
}`;
}

const DEBUG = process.env.DEBUG_GROQ !== undefined && process.env.DEBUG_GROQ !== '0';

/**
 * Stream explanation from Groq. Yields raw text chunks; caller handles JSON parsing.
 * Logs request/response when DEBUG_GROQ=1.
 */
export async function* streamExplanation(options) {
  const {
    type,
    text,
    context,
    title,
    depth = 'standard',
    knownConcepts = [],
  } = options;

  const systemPrompt = buildSystemPrompt(depth, knownConcepts, title, context);
  const userPrompt =
    type === 'highlight'
      ? buildHighlightPrompt(text, context)
      : buildParagraphPrompt(text);

  requireGroq();
  if (DEBUG) {
    console.log('[Groq] request', { model: MODEL, type, depth, textLen: text?.length, contextLen: context?.length });
  }

  let stream;
  try {
    stream = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      stream: true,
      temperature: 0.3,
    });
  } catch (err) {
    if (DEBUG) console.error('[Groq] create failed', err?.message || err);
    throw err;
  }

  let tokenCount = 0;
  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      tokenCount += 1;
      yield content;
    }
  }
  if (DEBUG) console.log('[Groq] stream done', { tokens: tokenCount });
}

const EXTRACT_SYSTEM = `You extract the main article content from HTML. Return ONLY a JSON object with no other text, no markdown, no code fence:
{
  "title": "Article title here",
  "paragraphs": ["First paragraph plain text.", "Second paragraph.", "..."]
}
- "title": the article or page title (string).
- "paragraphs": array of strings, each one a single paragraph of the article body. Strip all HTML, keep plain text only. Omit navigation, ads, and boilerplate. If the HTML has no article, return short placeholder title and one paragraph saying "No article content found."
}`;

/**
 * Use Groq to extract article title and paragraphs from raw HTML.
 * Used when Readability fails. html may be truncated to stay under token limits.
 */
export async function extractArticleFromHtml(html, urlHint = '') {
  requireGroq();
  const maxLen = 28000;
  const truncated = html.length > maxLen ? html.slice(0, maxLen) + '\n...[truncated]' : html;
  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: EXTRACT_SYSTEM },
      {
        role: 'user',
        content: `Extract the main article from this HTML${urlHint ? ` (page: ${urlHint})` : ''}:\n\n${truncated}`,
      },
    ],
    temperature: 0.2,
    max_tokens: 4096,
  });
  const raw = completion.choices[0]?.message?.content?.trim() || '';
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  const str = jsonMatch ? jsonMatch[0] : raw;
  try {
    const out = JSON.parse(str);
    const title = typeof out.title === 'string' ? out.title : 'Untitled';
    const par = Array.isArray(out.paragraphs) ? out.paragraphs : [];
    const paragraphs = par.filter((p) => typeof p === 'string' && p.trim().length >= 10);
    return {
      title,
      author: '',
      date: '',
      source: urlHint || '',
      paragraphs: paragraphs.length ? paragraphs : [raw.slice(0, 500) || 'No content extracted.'],
      fullText: paragraphs.join('\n\n'),
    };
  } catch (_) {
    return {
      title: 'Untitled',
      author: '',
      date: '',
      source: urlHint || '',
      paragraphs: [raw.slice(0, 2000) || 'Could not extract article.'],
      fullText: raw.slice(0, 2000) || '',
    };
  }
}
