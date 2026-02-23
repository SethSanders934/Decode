import { Router } from 'express';
import db from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.post('/', authMiddleware, (req, res) => {
  const { title, fullText, paragraphs } = req.body || {};
  if (!title || !fullText || !Array.isArray(paragraphs)) {
    return res.status(400).json({ error: 'title, fullText, and paragraphs required' });
  }
  const stmt = db.prepare(
    'INSERT INTO articles (user_id, title, full_text, paragraphs_json) VALUES (?, ?, ?, ?)'
  );
  stmt.run(req.userId, title, fullText, JSON.stringify(paragraphs));
  const row = db.prepare('SELECT id, title, full_text, paragraphs_json, created_at FROM articles WHERE id = last_insert_rowid()').get();
  res.status(201).json({
    id: row.id,
    title: row.title,
    fullText: row.full_text,
    paragraphs: JSON.parse(row.paragraphs_json),
    createdAt: row.created_at,
  });
});

router.get('/', authMiddleware, (req, res) => {
  const rows = db.prepare(
    `SELECT a.id, a.title, a.created_at,
      (SELECT COUNT(*) FROM explanations e WHERE e.article_id = a.id) as explanation_count
     FROM articles a WHERE a.user_id = ? ORDER BY a.created_at DESC`
  ).all(req.userId);
  res.json({ articles: rows });
});

router.get('/:id', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!id) return res.status(400).json({ error: 'Invalid id' });
  const row = db.prepare(
    'SELECT id, title, full_text, paragraphs_json, created_at FROM articles WHERE id = ? AND user_id = ?'
  ).get(id, req.userId);
  if (!row) return res.status(404).json({ error: 'Article not found' });
  const explanations = db.prepare(
    'SELECT id, type, selection_text, depth, explanation_text, concepts_json, created_at FROM explanations WHERE article_id = ? ORDER BY created_at ASC'
  ).all(id);
  res.json({
    id: row.id,
    title: row.title,
    fullText: row.full_text,
    paragraphs: JSON.parse(row.paragraphs_json),
    createdAt: row.created_at,
    explanations: explanations.map((e) => ({
      id: e.id,
      type: e.type,
      selectionText: e.selection_text,
      depth: e.depth,
      explanation: e.explanation_text,
      concepts: e.concepts_json ? JSON.parse(e.concepts_json) : [],
      createdAt: e.created_at,
    })),
  });
});

export default router;
