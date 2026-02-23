import { Router } from 'express';
import db from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.post('/', authMiddleware, (req, res) => {
  const { articleId, type, selectionText, depth, explanation, concepts } = req.body || {};
  if (!articleId || !type || !depth || !explanation) {
    return res.status(400).json({ error: 'articleId, type, depth, and explanation required' });
  }
  const aid = parseInt(articleId, 10);
  const article = db.prepare('SELECT id, user_id FROM articles WHERE id = ? AND user_id = ?').get(aid, req.userId);
  if (!article) return res.status(404).json({ error: 'Article not found' });
  const stmt = db.prepare(
    'INSERT INTO explanations (article_id, user_id, type, selection_text, depth, explanation_text, concepts_json) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );
  stmt.run(
    aid,
    req.userId,
    type,
    selectionText || null,
    depth,
    explanation,
    concepts ? JSON.stringify(concepts) : null
  );
  const row = db.prepare('SELECT id, created_at FROM explanations WHERE id = last_insert_rowid()').get();
  res.status(201).json({ id: row.id, createdAt: row.created_at });
});

export default router;
