import { Router } from 'express';
import { streamExplanation } from '../services/ai.js';

const router = Router();
const DEBUG = process.env.DEBUG_GROQ !== undefined && process.env.DEBUG_GROQ !== '0';

router.post('/', async (req, res) => {
  const { type, text, context, title, depth, knownConcepts } = req.body ?? {};
  const safe = {
    type: type || 'paragraph',
    text: typeof text === 'string' ? text : '',
    context: typeof context === 'string' ? context : '',
    title: typeof title === 'string' ? title : 'Article',
    depth: depth || 'standard',
    knownConcepts: Array.isArray(knownConcepts) ? knownConcepts : [],
  };

  if (!safe.text || safe.text.trim().length < 3) {
    if (DEBUG) console.log('[Explain] 400 missing text');
    return res.status(400).json({ error: 'Missing or too short "text".' });
  }
  if (!safe.context) safe.context = safe.text;
  if (!safe.title) safe.title = 'Article';

  let streamStarted = false;
  try {
    const gen = streamExplanation(safe);
    const first = await gen.next();
    if (first.done && first.value === undefined) {
      if (!res.headersSent) return res.status(502).json({ error: 'Groq returned no content.' });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();
    streamStarted = true;

    if (first.value) {
      res.write(`data: ${JSON.stringify({ chunk: first.value })}\n\n`);
    }

    for await (const chunk of gen) {
      res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
    }
    res.write('data: [DONE]\n\n');
  } catch (err) {
    const msg = (err && (err.message || err.error?.message || err.statusText)) || String(err);
    const detail = msg || 'Unknown server error';
    if (DEBUG) console.error('[Explain] error', detail, err);
    if (!res.headersSent) {
      return res.status(500).json({
        error: 'Explanation failed',
        detail,
      });
    }
    if (streamStarted) {
      res.write(`data: ${JSON.stringify({ error: detail })}\n\n`);
    }
  } finally {
    if (!res.writableEnded) res.end();
  }
});

export default router;
