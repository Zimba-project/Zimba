
import { request } from './requestBase';

export const register = (data) => request('/auth/register', 'POST', data);
export const login = (data) => request('/auth/login', 'POST', data);
export const me = (token) => request('/auth/me', "GET", null, token);


export const updateUser = async (userId, data) => {
  return await request(`/users/${userId}`, 'PUT', data);
};


export default { register, login, me, updateUser };
