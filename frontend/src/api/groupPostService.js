import { request } from './requestBase';
import { sessionStorage } from '../utils/Storage';

const getToken = async () => {
  try { return await sessionStorage.getItem('authToken'); } catch (e) { return null; }
};

export const listGroupPosts = async (groupId) => {
  const res = await request(`/groups/${groupId}/posts`);
  if (!res.ok) throw new Error(res.body?.error || `Error fetching group posts (status ${res.status})`);
  return res.body.posts || [];
};

export const createGroupPost = async (groupId, data) => {
  const token = await getToken();
  const res = await request(`/groups/${groupId}/posts`, 'POST', data, token);
  if (!res.ok) throw new Error(res.body?.error || `Error creating group post (status ${res.status})`);
  return res.body;
};

export const approveGroupPost = async (groupId, postId) => {
  const token = await getToken();
  const res = await request(`/groups/${groupId}/posts/${postId}/approve`, 'POST', null, token);
  if (!res.ok) throw new Error(res.body?.error || `Error approving post (status ${res.status})`);
  return res.body;
};

export const rejectGroupPost = async (groupId, postId) => {
  const token = await getToken();
  const res = await request(`/groups/${groupId}/posts/${postId}/reject`, 'POST', null, token);
  if (!res.ok) throw new Error(res.body?.error || `Error rejecting post (status ${res.status})`);
  return res.body;
};

export default { listGroupPosts, createGroupPost, approveGroupPost, rejectGroupPost };
export const getOptions = async (groupId, postId) => {
  const token = await getToken();
  const res = await request(`/groups/${groupId}/posts/${postId}/options`, 'GET', null, token);
  if (!res.ok) throw new Error(res.body?.error || `Error fetching options (status ${res.status})`);
  // returns { options: [...], user_vote: <optionId|null> }
  return res.body || { options: [], user_vote: null };
};

export const vote = async (groupId, postId, optionId) => {
  const token = await getToken();
  const res = await request(`/groups/${groupId}/posts/${postId}/vote`, 'POST', { option_id: optionId }, token);
  if (!res.ok) throw new Error(res.body?.error || `Error voting (status ${res.status})`);
  return res.body.options || [];
};

export const getComments = async (groupId, postId) => {
  const res = await request(`/groups/${groupId}/posts/${postId}/comments`);
  if (!res.ok) throw new Error(res.body?.error || `Error fetching comments (status ${res.status})`);
  return res.body.comments || [];
};

export const addComment = async (groupId, postId, comment) => {
  const token = await getToken();
  const res = await request(`/groups/${groupId}/posts/${postId}/comments`, 'POST', { comment }, token);
  if (!res.ok) throw new Error(res.body?.error || `Error adding comment (status ${res.status})`);
  return res.body;
};
