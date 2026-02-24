
import { request } from './requestBase';

export const register = (data) => request('/auth/register', 'POST', data);
export const login = (data) => request('/auth/login', 'POST', data);
export const me = (token) => request('/auth/me', "GET", null, token);

export const getUserById = async (userId) => {
  try {
    const res = await request(`/users/${userId}`, 'GET');
    return res.body;
  } catch (err) {
    console.log('Full error:', err.stack); // <-- shows exact file + line
    throw err;
  }
};

export const updateUser = async (userId, data) => {
  return await request(`/users/${userId}`, 'PUT', data);
};


export default { register, login, me, getUserById, updateUser };
