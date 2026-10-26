import { useEffect, useState } from "react";

// useState that is loaded from and saved to localStorage under `key`.
// `parse` validates what was stored; returning null/undefined falls back to `init`.
export default function useStoredState(key, init, parse = (x) => x) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw != null) {
        const parsed = parse(JSON.parse(raw));
        if (parsed != null) return parsed;
      }
    } catch {
      // Unreadable or blocked storage: start fresh.
    }
    return typeof init === "function" ? init() : init;
  });

  useEffect(() => {
    try {
      if (value == null) localStorage.removeItem(key);
      else localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage full or blocked: keep working in memory.
    }
  }, [key, value]);

  return [value, setValue];
}
