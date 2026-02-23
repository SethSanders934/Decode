import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const TOKEN_KEY = 'decode_token';
const USER_KEY = 'decode_user';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(() => {
    try {
      const u = localStorage.getItem(USER_KEY);
      return u ? JSON.parse(u) : null;
    } catch (_) {
      return null;
    }
  });

  const setToken = useCallback((t) => {
    setTokenState(t);
    if (t) localStorage.setItem(TOKEN_KEY, t);
    else localStorage.removeItem(TOKEN_KEY);
  }, []);

  const setUserState = useCallback((u) => {
    setUser(u);
    if (u) localStorage.setItem(USER_KEY, JSON.stringify(u));
    else localStorage.removeItem(USER_KEY);
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    setToken(data.token);
    setUserState(data.user);
    return data;
  }, [setToken, setUserState]);

  const register = useCallback(async (email, password) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    setToken(data.token);
    setUserState(data.user);
    return data;
  }, [setToken, setUserState]);

  const logout = useCallback(() => {
    setToken(null);
    setUserState(null);
  }, [setToken, setUserState]);

  const fetchWithAuth = useCallback((url, options = {}) => {
    const headers = { ...options.headers };
    if (token) headers.Authorization = `Bearer ${token}`;
    return fetch(url, { ...options, headers });
  }, [token]);

  useEffect(() => {
    if (!token) {
      setUser(null);
      return;
    }
    fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => {
        if (r.ok) return r.json();
        setToken(null);
        setUserState(null);
      })
      .then((data) => {
        if (data?.user) setUserState(data.user);
      })
      .catch(() => {});
  }, [token, setToken, setUserState]);

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, fetchWithAuth, isLoggedIn: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
