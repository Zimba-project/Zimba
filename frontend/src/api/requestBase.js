const EXPO_PUBLIC_API_BASE = process.env.EXPO_PUBLIC_API_BASE;

export const request = async (path, method = 'GET', body = null, token = null) => {
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const opts = { method, headers };
  if (body) {
    opts.body = JSON.stringify(body);
  }

  const res = await fetch(`${EXPO_PUBLIC_API_BASE}${path}`, opts);

  let json = {};
  try {
    json = await res.json();
  } catch {
    // No JSON body
  }

  return { ok: res.ok, status: res.status, body: json };
};
