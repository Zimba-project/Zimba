
import { request } from './requestBase';

export const register = (data) => request('/auth/register', 'POST', data);
export const login = (data) => request('/auth/login', 'POST', data);
export const me = (token) => request('/auth/me', "GET", null, token);

export default { register, login, me };
