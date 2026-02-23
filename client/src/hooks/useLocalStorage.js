import { useState, useCallback } from 'react';

export function useLocalStorage(key, initialValue) {
  const [stored, setStored] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value) => {
      try {
        const next = value instanceof Function ? value(stored) : value;
        setStored(next);
        window.localStorage.setItem(key, JSON.stringify(next));
      } catch (_) {}
    },
    [key, stored]
  );

  return [stored, setValue];
}
