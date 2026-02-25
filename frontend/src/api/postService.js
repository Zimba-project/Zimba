import { request } from './requestBase';

export const getAllPosts = async () => {
    const res = await request('/posts');
    if (!res.ok) throw new Error(res.body?.error || `Error fetching posts (status ${res.status})`);
    return res.body.posts || res.body; 
};

export const getPostById = async (postId) => {
    const res = await request(`/posts/${postId}`);
    if (!res.ok) throw new Error(res.body?.error || `Error fetching post (status ${res.status})`);
    return res.body.post || res.body;
};

export const createPost = async (data) => {
    const res = await request('/posts', 'POST', data);
    if (!res.ok) throw new Error(res.body?.error || `Error creating post (status ${res.status})`);
    return res.body;
};

export const getPollOptions = async (postId) => {
  const res = await request(`/posts/${postId}/options`);
  if (!res.ok) throw new Error(res.body?.error || `Error fetching poll options (status ${res.status})`);
  return res.body; 
};

export const votePoll = async (questionId, optionIds, userId) => {
  const res = await request(`/posts/${questionId}/vote`, 'POST', {
    questionId: questionId,
    userId: userId,
    optionIds: optionIds
  });

  if (!res.ok) {
    throw new Error(res.body?.error || `Error submitting vote (status ${res.status})`);
  }

  return res.body;
};


export const getPostComments = async (postId) => {
    const res = await request(`/posts/${postId}/comments`);

    if (!res.ok) {
        throw new Error(res.body?.error || "Failed to fetch comments");
    }

    const raw = res.body?.comments || [];

    return raw.map(c => ({
      id: c.id,
      text: c.comment,
      author_name: c.user_name,
      author_avatar: c.user_avatar,
      created_at: c.created_at,
      user_id: c.user_id,
      replies: (c.replies || []).map(r => ({
        id: r.id,
        text: r.text || r.reply,
        author_name: r.user_name,
        author_avatar: r.user_avatar,
        created_at: r.created_at,
        user_id: r.user_id,
      }))
    }));
};

export const addPostComment = async (postId, userId, comment) => {
  const res = await request(`/posts/${postId}/comments`, 'POST', { user_id: userId, comment });
  if (!res.ok) throw new Error(res.body?.error || `Failed to add comment (status ${res.status})`);
  return res.body;
};

export const replyToComment = async (postId, commentId, userId, reply) => {
  const res = await request(`/posts/${postId}/comments/${commentId}/replies`, 'POST', { user_id: userId, reply });
  if (!res.ok) throw new Error(res.body?.error || `Failed to add reply (status ${res.status})`);
  return res.body;
};

export const searchPosts = async (query) => {
  const q = (query || '').trim().toLowerCase();
  if (!q) return await getAllPosts();
  const all = await getAllPosts();
  return (all || []).filter(p => {
    const title = String(p.title || '').toLowerCase();
    const desc = String(p.description || '').toLowerCase();
    const topic = String(p.topic || '').toLowerCase();
    const author = String(p.author_name || p.author?.name || '').toLowerCase();
    return title.includes(q) || desc.includes(q) || topic.includes(q) || author.includes(q);
  });
};


// ---------- User API ----------
export const pickAndUploadAvatar = async (userId, formData) => {
  const res = await request(`/users/${userId}/avatar`, 'POST', formData, {});
  if (!res.ok) throw new Error(res.body?.error || `Failed to upload avatar (status ${res.status})`);
  return res.body;
};

export default { getAllPosts, createPost,  getPollOptions, votePoll, getPostComments, addPostComment, replyToComment, searchPosts, pickAndUploadAvatar };