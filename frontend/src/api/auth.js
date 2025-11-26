
import { sessionStorage } from '../utils/Storage';
const EXPO_PUBLIC_API_BASE = process.env.EXPO_PUBLIC_API_BASE;
async function request(path, method = 'GET', body, token) {
    console.log("REQUEST:", body, token)
    const opts = { method };
    opts.headers = !token ?  
        { 'Content-Type': 'application/json' }
        :
        {
            'Content-Type': 'application/json',
            "Authorization": 'Bearer ' + token
        }
        
    
    if (body) opts.body = JSON.stringify(body);
    console.log(opts.headers)
    const res = await fetch(`${EXPO_PUBLIC_API_BASE}${path}`, opts);
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

    
    const res = await fetch(`${EXPO_PUBLIC_API_BASE}${path}`, opts);
    let json = {};
    try {
        json = await res.json();
    } catch (e) {
        // No JSON body
    }

    return { ok: res.ok, status: res.status, body: json };
}



export const register = (data) => request('/auth/register', 'POST', data);
export const login = (data) => request(`/auth/login`, 'POST', data);
export const me = (token) => getRequest('/auth/me', "GET", token);
export const updateUser = (token, data) => request('/auth/me', "POST", data, token);


export default { register, login, me };
