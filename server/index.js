import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import express from 'express';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '.env') });
dotenv.config({ path: join(__dirname, '..', '.env') });
import cors from 'cors';
import explainRoutes from './routes/explain.js';
import authRoutes from './routes/auth.js';
import articlesRoutes from './routes/articles.js';
import explanationsRoutes from './routes/explanations.js';
import { authMiddleware } from './middleware/auth.js';
import { testGroqConnection, suggestTitle } from './services/ai.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use('/api/explain', explainRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/articles', authMiddleware, articlesRoutes);
app.use('/api/explanations', authMiddleware, explanationsRoutes);

app.get('/api/debug/groq', async (_req, res) => {
  try {
    const result = await testGroqConnection();
    res.json({ groq: result.ok ? 'connected' : 'unexpected_response', ...result });
  } catch (err) {
    console.error('[DEBUG] Groq test failed', err?.message || err);
    res.status(500).json({
      groq: 'error',
      error: err?.message || String(err),
    });
  }
});

app.post('/api/suggest-title', async (req, res) => {
  try {
    const { text } = req.body || {};
    if (!text || typeof text !== 'string') return res.status(400).json({ error: 'Missing text' });
    const title = await suggestTitle(text);
    res.json({ title: title || 'Article' });
  } catch (err) {
    res.status(500).json({ error: err?.message || 'Failed to suggest title' });
  }
});

app.get('/api/status', async (_req, res) => {
  const groqKeySet = !!process.env.GROQ_API_KEY;
  let groqTest = 'not_checked';
  let groqError = '';
  if (groqKeySet) {
    try {
      const r = await testGroqConnection();
      groqTest = r.ok ? 'ok' : 'unexpected';
      if (!r.ok) groqError = r.response || 'Unexpected response';
    } catch (e) {
      groqTest = 'error';
      groqError = e?.message || String(e);
    }
  }
  res.json({
    server: 'ok',
    groqKeySet,
    groqTest,
    groqError: groqError || undefined,
  });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  const detail = err?.message || String(err);
  res.status(500).json({
    error: 'Something went wrong.',
    detail: detail || 'Try pasting the article text directly.',
  });
});

app.listen(PORT, () => {
  console.log(`Decode API server running at http://localhost:${PORT}`);
  console.log(`Open the app in your browser at http://localhost:5173 (or 5174 if 5173 is in use)`);
  if (!process.env.GROQ_API_KEY) {
    console.log('');
    console.log('*** GROQ_API_KEY is not set. Explanations will not work. ***');
    console.log('Add a file named .env in the "server" folder with this line:');
    console.log('  GROQ_API_KEY=your_key_here');
    console.log('');
  } else {
    console.log('GROQ_API_KEY is set – explanations should work.');
  }
});
