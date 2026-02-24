
import { request } from './requestBase';

export const register = (data) => request('/auth/register', 'POST', data);
export const login = (data) => request('/auth/login', 'POST', data);
export const me = (token) => request('/auth/me', "GET", null, token);

export const getUserById = async (userId) => {
  console.log('getUserById called with userId:', userId);
  const res = await request(`/users/${userId}`, 'GET');
  console.log('getUserById response:', { ok: res.ok, status: res.status, body: res.body });
  if (!res.ok) throw new Error(res.body?.message || res.body?.error || `Error fetching user (status ${res.status})`);
  return res.body; // returns { user, posts, postCount }
};

export const updateUser = async (userId, data) => {
  return await request(`/users/${userId}`, 'PUT', data);
};


export default { register, login, me, getUserById, updateUser };
