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
  const token = await getToken();
  const res = await request(`/groups/${id}`, 'GET', null, token);
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

export const listMyGroups = async () => {
  const token = await getToken();
  const res = await request('/groups/mine', 'GET', null, token);
  if (!res.ok) {
    console.error('List my groups failed response:', { status: res.status, statusText: res.statusText, url: res.url, body: res.body });
    const message = res.body?.error || res.body?.raw || `Error fetching my groups (status ${res.status})`;
    throw new Error(message);
  }
  return res.body.groups || [];
};

export const listJoinRequests = async (groupId) => {
  const token = await getToken();
  const res = await request(`/groups/${groupId}/requests`, 'GET', null, token);
  if (!res.ok) {
    console.error('List join requests failed response:', { status: res.status, statusText: res.statusText, url: res.url, body: res.body });
    const message = res.body?.error || res.body?.raw || `Error fetching join requests (status ${res.status})`;
    throw new Error(message);
  }
  return res.body.requests || [];
};

export const approveRequest = async (groupId, reqId) => {
  const token = await getToken();
  const res = await request(`/groups/${groupId}/requests/${reqId}/approve`, 'POST', null, token);
  if (!res.ok) {
    console.error('Approve request failed response:', { status: res.status, statusText: res.statusText, url: res.url, body: res.body });
    const message = res.body?.error || res.body?.raw || `Error approving request (status ${res.status})`;
    throw new Error(message);
  }
  return res.body;
};

export const rejectRequest = async (groupId, reqId) => {
  const token = await getToken();
  const res = await request(`/groups/${groupId}/requests/${reqId}/reject`, 'POST', null, token);
  if (!res.ok) {
    console.error('Reject request failed response:', { status: res.status, statusText: res.statusText, url: res.url, body: res.body });
    const message = res.body?.error || res.body?.raw || `Error rejecting request (status ${res.status})`;
    throw new Error(message);
  }
  return res.body;
};

export const deleteGroup = async (id) => {
  const token = await getToken();
  const res = await request(`/groups/${id}`, 'DELETE', null, token);
  if (!res.ok) {
    console.error('Delete group failed response:', { status: res.status, statusText: res.statusText, url: res.url, body: res.body });
    const message = res.body?.error || res.body?.raw || `Error deleting group (status ${res.status})`;
    throw new Error(message);
  }
  return res.body;
};

export const removeMember = async (groupId, memberId) => {
  const token = await getToken();
  const res = await request(`/groups/${groupId}/members/${memberId}`, 'DELETE', null, token);
  if (!res.ok) {
    console.error('Remove member failed response:', { status: res.status, statusText: res.statusText, url: res.url, body: res.body });
    const message = res.body?.error || res.body?.raw || `Error removing member (status ${res.status})`;
    throw new Error(message);
  }
  return res.body;
};

export const updateGroup = async (id, data) => {
  const token = await getToken();
  const res = await request(`/groups/${id}`, 'PUT', data, token);
  if (!res.ok) {
    console.error('Update group failed response:', { status: res.status, statusText: res.statusText, url: res.url, body: res.body });
    const message = res.body?.error || res.body?.raw || `Error updating group (status ${res.status})`;
    throw new Error(message);
  }
  return res.body;
};

export default { listGroups, createGroup, getGroup, joinGroup, leaveGroup, updateGroup };
