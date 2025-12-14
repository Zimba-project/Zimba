const API_BASE = process.env.EXPO_PUBLIC_API_BASE;

export const request = async (path, method = 'GET', body = null, token = null) => {
  if (!API_BASE) {
    throw new Error('API base URL is not defined. Check EXPO_PUBLIC_API_BASE in your .env file.');
  }

  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const opts = { method, headers };
  if (body) {
    opts.body = JSON.stringify(body);
  }

  const url = `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;

  let res;
  try {
    res = await fetch(url, opts);
  } catch (err) {
    // Network error
    return { ok: false, status: 0, body: { error: 'Network error', details: err.message } };
  }

  let data;
  // Read the response body as text once, then try to parse JSON.
  // This avoids "Already read" / "body used" errors when attempting
  // to call both res.json() and res.text().
  const text = await res.text();
  try {
    data = text ? JSON.parse(text) : null;
  } catch (err) {
    data = { error: 'Invalid JSON response', raw: text };
  }

  // Return statusText and request url for easier debugging
  return { ok: res.ok, status: res.status, statusText: res.statusText, url, body: data };
};
