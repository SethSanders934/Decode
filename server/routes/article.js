import { Router } from 'express';
import { extractArticle, extractArticleFromHtmlInput } from '../services/extractor.js';

const router = Router();

const safeMessage = (err) =>
  err && typeof err.message === 'string' ? err.message : 'Could not extract article. Try pasting the article text directly.';

/** Never call next(err); always send 422 so we never hit the 500 handler. */
function wrap(fn) {
  return (req, res, _next) => {
    Promise.resolve()
      .then(() => fn(req, res))
      .then((data) => {
        if (data !== undefined && !res.headersSent) res.json(data);
      })
      .catch((err) => {
        if (!res.headersSent) {
          res.status(422).json({ error: safeMessage(err) });
        }
      });
  };
}

router.get(
  '/',
  wrap(async (req, res) => {
    const url = req.query.url;
    if (!url || typeof url !== 'string') {
      res.status(400).json({ error: 'Missing url query parameter' });
      return undefined;
    }
    const data = await extractArticle(url.trim());
    if (!data || !Array.isArray(data.paragraphs) || data.paragraphs.length === 0) {
      throw new Error('Could not extract article content. Try pasting the article text directly.');
    }
    return data;
  })
);

router.post(
  '/extract',
  wrap(async (req, res) => {
    const { html, source = '' } = req.body || {};
    if (!html) {
      res.status(400).json({ error: 'Missing "html" in request body.' });
      return undefined;
    }
    const data = await extractArticleFromHtmlInput(html, typeof source === 'string' ? source : '');
    if (!data || !Array.isArray(data.paragraphs) || data.paragraphs.length === 0) {
      throw new Error('Could not extract article from HTML. Try pasting plain text instead.');
    }
    return data;
  })
);

export default router;
