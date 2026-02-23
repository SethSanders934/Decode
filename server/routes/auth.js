import { Router } from 'express';
import bcrypt from 'bcryptjs';
import db from '../db.js';
import { signToken, authMiddleware } from '../middleware/auth.js';

const router = Router();

router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    const emailNorm = String(email).trim().toLowerCase();
    if (emailNorm.length < 3) return res.status(400).json({ error: 'Invalid email' });
    if (String(password).length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    const hash = await bcrypt.hash(String(password), 10);
    const stmt = db.prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)');
    stmt.run(emailNorm, hash);
    const row = db.prepare('SELECT id, email FROM users WHERE id = last_insert_rowid()').get();
    const token = signToken(row.id, row.email);
    res.json({ token, user: { id: row.id, email: row.email } });
  } catch (e) {
    if (e.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ error: 'Email already registered' });
    }
    throw e;
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }
  const emailNorm = String(email).trim().toLowerCase();
  const row = db.prepare('SELECT id, email, password_hash FROM users WHERE email = ?').get(emailNorm);
  if (!row) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  const ok = await bcrypt.compare(String(password), row.password_hash);
  if (!ok) return res.status(401).json({ error: 'Invalid email or password' });
  const token = signToken(row.id, row.email);
  res.json({ token, user: { id: row.id, email: row.email } });
});

router.get('/me', authMiddleware, (req, res) => {
  res.json({ user: { id: req.userId, email: req.userEmail } });
});

export default router;
