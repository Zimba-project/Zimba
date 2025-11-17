
import { sessionStorage } from '../utils/Storage';
const API_BASE = process.env.API_BASE;
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

async function getRequest(path, method = 'GET', extraHeaders = "fuck this") {
   const opts = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            "Authorization": 'Bearer ' + extraHeaders
        }
    };

    const res = await fetch(`${API_BASE}${path}`, opts);
    let json = {};
    try {
        json = await res.json();
    } catch (e) {
        // No JSON body
    }

    return { ok: res.ok, status: res.status, body: json };
}



export const register = (data) => request('/auth/register', 'POST', data);
export const login = (data) => request('/auth/login', 'POST', data);
export const me = (token) => getRequest('/auth/me', "GET", token);
export const deleteAccount = (data, token) => {
    const opts = { method: 'POST', headers: { 'Content-Type': 'application/json' } };
    if (data) opts.body = JSON.stringify(data);
    if (token) opts.headers['Authorization'] = 'Bearer ' + token;
    return fetch(`${API_BASE}/auth/delete`, opts).then(async (res) => {
        let json = {};
        try { json = await res.json(); } catch (e) {}
        return { ok: res.ok, status: res.status, body: json };
    });
};


export default { register, login, me };
