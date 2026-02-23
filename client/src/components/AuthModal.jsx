import { useState } from 'react';

export default function AuthModal({ mode, onClose, onLogin, onRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isLogin = mode === 'login';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) await onLogin(email, password);
      else await onRegister(email, password);
      onClose();
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
      <div className="bg-decode-card rounded-xl shadow-xl max-w-sm w-full p-6 border border-decode-cardBorder" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-semibold text-decode-article mb-4">
          {isLogin ? 'Log in' : 'Register'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-decode-article mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 rounded border border-decode-cardBorder bg-decode-bg text-decode-article focus:outline-none focus:ring-2 focus:ring-decode-accent"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-decode-article mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={isLogin ? 1 : 6}
              className="w-full px-3 py-2 rounded border border-decode-cardBorder bg-decode-bg text-decode-article focus:outline-none focus:ring-2 focus:ring-decode-accent"
              placeholder={isLogin ? '' : 'At least 6 characters'}
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 px-4 bg-decode-accent text-white rounded-lg font-medium hover:bg-decode-tagText disabled:opacity-50"
            >
              {loading ? '…' : isLogin ? 'Log in' : 'Register'}
            </button>
            <button type="button" onClick={onClose} className="py-2 px-4 rounded-lg border border-decode-cardBorder hover:bg-decode-hover">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
