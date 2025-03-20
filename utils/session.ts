export function setSessionItem<T>(key: string, value: T) {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(key, JSON.stringify(value));
  }
}

export function getSessionItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  const raw = sessionStorage.getItem(key);
  if (!raw) return defaultValue;
  try {
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error(`Error parsing session item ${key}`, err);
    return defaultValue;
  }
}

export function removeSessionItem(key: string) {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(key);
  }
}

export function clearSession() {
  if (typeof window !== 'undefined') {
    sessionStorage.clear();
  }
}