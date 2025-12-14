import { request } from './requestBase';
import { sessionStorage } from '../utils/Storage';

const getToken = async () => {
  try {
    const t = await sessionStorage.getItem('authToken');
    return t;
  } catch (e) {
    return null;
  }
};

export const listGroups = async (q = '') => {
  const res = await request(`/groups${q ? `?q=${encodeURIComponent(q)}` : ''}`);
  if (!res.ok) {
    console.error('List groups failed response:', { status: res.status, statusText: res.statusText, url: res.url, body: res.body });
    const message = res.body?.error || res.body?.raw || `Error fetching groups (status ${res.status})`;
    throw new Error(message);
  }
  return res.body.groups || [];
};

export const createGroup = async (data) => {
  const token = await getToken();
  const res = await request('/groups', 'POST', data, token);
  if (!res.ok) {
    console.error('Create group failed response:', { status: res.status, statusText: res.statusText, url: res.url, body: res.body });
    const message = res.body?.error || res.body?.raw || `Error creating group (status ${res.status})`;
    throw new Error(message);
  }
  return res.body;
};

export const getGroup = async (id) => {
  const res = await request(`/groups/${id}`);
  if (!res.ok) {
    console.error('Get group failed response:', { status: res.status, statusText: res.statusText, url: res.url, body: res.body });
    const message = res.body?.error || res.body?.raw || `Error fetching group (status ${res.status})`;
    throw new Error(message);
  }
  return res.body;
};

export const joinGroup = async (id) => {
  const token = await getToken();
  const res = await request(`/groups/${id}/join`, 'POST', null, token);
  if (!res.ok) {
    console.error('Join group failed response:', { status: res.status, statusText: res.statusText, url: res.url, body: res.body });
    const message = res.body?.error || res.body?.raw || `Error joining group (status ${res.status})`;
    throw new Error(message);
  }
  return res.body;
};

export const leaveGroup = async (id) => {
  const token = await getToken();
  const res = await request(`/groups/${id}/leave`, 'POST', null, token);
  if (!res.ok) {
    console.error('Leave group failed response:', { status: res.status, statusText: res.statusText, url: res.url, body: res.body });
    const message = res.body?.error || res.body?.raw || `Error leaving group (status ${res.status})`;
    throw new Error(message);
  }
  return res.body;
};

export default { listGroups, createGroup, getGroup, joinGroup, leaveGroup };
