const API_BASE = 'http://192.168.0.103:3001/api';

async function request(path, method = 'GET', body) {
    const opts = { method, headers: { 'Content-Type': 'application/json' } };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(`${API_BASE}${path}`, opts);
    let json = {};
    try {
        json = await res.json();
    } catch (e) {
        // no JSON body
    }
    return { ok: res.ok, status: res.status, body: json };
}

export const register = (data) => request('/auth/register', 'POST', data);
export const login = (data) => request('/auth/login', 'POST', data);
export const me = () => request('/auth/me', 'GET');

export default { register, login, me };
