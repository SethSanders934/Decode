import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import { extractArticleFromHtml } from './ai.js';

const MAX_HTML_LENGTH = 500000;

const FALLBACK_MSG = 'Could not extract article. Try pasting the article text directly.';

function getSource(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '') || '';
  } catch (_) {
    return '';
  }
}

/**
 * Fetch HTML from URL, then extract article with Readability; on failure, try Groq.
 * All errors are thrown as Error with a safe message so the route can return 422.
 */
export async function extractArticle(url) {
  const source = getSource(url);
  let html;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    html = await res.text();
  } catch (err) {
    throw new Error(FALLBACK_MSG);
  }

  if (!html || html.length < 100) {
    throw new Error(FALLBACK_MSG);
  }

  const safeHtml = html.length > MAX_HTML_LENGTH ? html.slice(0, MAX_HTML_LENGTH) : html;

  try {
    const dom = new JSDOM(safeHtml, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (article && article.textContent && article.textContent.trim().length > 50) {
      const paragraphs = htmlToParagraphs(article.content);
      if (paragraphs.length > 0) {
        return {
          title: article.title || 'Untitled',
          author: article.byline || '',
          date: article.publishedTime || '',
          source,
          paragraphs,
          fullText: paragraphs.join('\n\n'),
        };
      }
    }
  } catch (_) {
    /* Readability/JSDOM failed; fall back to Groq */
  }

  try {
    const data = await extractArticleFromHtml(safeHtml, source);
    return { ...data, source };
  } catch (_) {
    throw new Error(FALLBACK_MSG);
  }
}

/**
 * Extract article from raw HTML (e.g. from client or CORS proxy).
 * Tries Readability first, then Groq.
 */
export async function extractArticleFromHtmlInput(html, source = '') {
  if (!html || typeof html !== 'string' || html.trim().length < 50) {
    throw new Error('No valid HTML content provided.');
  }
  const safeHtml = html.length > MAX_HTML_LENGTH ? html.slice(0, MAX_HTML_LENGTH) : html;

  try {
    const dom = new JSDOM(safeHtml, { url: 'https://example.com/' });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (article && article.textContent && article.textContent.trim().length > 50) {
      const paragraphs = htmlToParagraphs(article.content);
      if (paragraphs.length > 0) {
        return {
          title: article.title || 'Untitled',
          author: article.byline || '',
          date: '',
          source: source || 'Pasted',
          paragraphs,
          fullText: paragraphs.join('\n\n'),
        };
      }
    }
  } catch (_) {}

  try {
    return await extractArticleFromHtml(safeHtml, source || 'Pasted');
  } catch (_) {
    throw new Error('Could not extract article from this HTML. Try pasting plain article text instead.');
  }
}

function htmlToParagraphs(html) {
  if (!html) return [];
  try {
    const dom = new JSDOM(`<body>${html}</body>`);
    const body = dom.window.document.body;
    const nodes = body.querySelectorAll('p');
    const paragraphs = [];
    for (const node of nodes) {
      const text = node.textContent.trim();
      if (text.length >= 15) paragraphs.push(text);
    }
    if (paragraphs.length > 0) return paragraphs;
    const full = body.textContent.trim();
    if (full) {
      const split = full.split(/\n\n+/).map((p) => p.trim()).filter((p) => p.length >= 15);
      if (split.length) return split;
      return [full];
    }
  } catch (_) {}
  return [];
}
