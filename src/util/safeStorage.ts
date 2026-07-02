export function safeJsonParse<T>(value: string | null, fallback: T): T {
  if (!value?.trim()) return fallback;

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function safeLocalStorageGetJson<T>(key: string, fallback: T): T {
  return safeStorageGetJson("localStorage", key, fallback);
}

export function safeSessionStorageGetJson<T>(key: string, fallback: T): T {
  return safeStorageGetJson("sessionStorage", key, fallback);
}

function safeStorageGetJson<T>(
  storageName: "localStorage" | "sessionStorage",
  key: string,
  fallback: T,
): T {
  if (typeof window === "undefined") return fallback;

  try {
    const storage = window[storageName];
    const value = storage.getItem(key);

    if (!value?.trim()) {
      if (value !== null) {
        storage.removeItem(key);
      }
      return fallback;
    }

    try {
      return JSON.parse(value) as T;
    } catch {
      storage.removeItem(key);
      return fallback;
    }
  } catch {
    return fallback;
  }
}
