const API_BASE = process.env.EXPO_PUBLIC_API_BASE?.replace(/\/api$/, '');

/**
 * Normalize a relative or absolute image URL.
 * If the value starts with http, return as-is.
 * Otherwise, prepend API_BASE.
 */
export const normalizeUrl = (path) => {
  if (!path) return null;
  return path.startsWith('http') ? path : `${API_BASE}${path}`;
};

/**
 * Normalize avatar URL specifically.
 * Works the same way as normalizeUrl, but kept separate for clarity.
 */
export const normalizeAvatarUrl = (path) => {
  if (!path) return null;
  return path.startsWith('http') ? path : `${API_BASE}${path}`;
};
