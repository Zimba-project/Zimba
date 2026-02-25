const API_BASE = process.env.EXPO_PUBLIC_API_BASE;

export const request = async (path, method = 'GET', body = null, token = null) => {
  if (!API_BASE) {
    throw new Error('API base URL is not defined. Check EXPO_PUBLIC_API_BASE in your .env file.');
  }

  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);

  const url = `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;

  let res;
  try {
    res = await fetch(url, opts);
  } catch (err) {
    return { ok: false, status: 0, body: { error: 'Network error', details: err.message } };
  }

  let data;
  try {
    const text = await res.text();   // read once
    try {
      data = text ? JSON.parse(text) : {};
    } catch (err) {
      data = { error: 'Invalid JSON response', raw: text };
    }
  } catch (err) {
    data = { error: 'Failed to read response body', details: err.message };
  }

  return { ok: res.ok, status: res.status, body: data };
};