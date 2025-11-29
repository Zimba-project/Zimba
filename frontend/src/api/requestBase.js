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
  const res = await fetch(url, opts);

  let json = {};
  try {
    json = await res.json();
  } catch {
    // No JSON body
  }

  return { ok: res.ok, status: res.status, body: json };
};
