const EXPO_PUBLIC_API_BASE = process.env.EXPO_PUBLIC_API_BASE
async function request(path, method = 'GET', body) {
    const opts = { method, headers: { 'Content-Type': 'application/json' } };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(`${EXPO_PUBLIC_API_BASE}${path}`, opts);
    let json = {};
    try {
        json = await res.json();
    } catch (e) {
        // Response has no JSON
    }
    return { ok: res.ok, status: res.status, body: json };
}

export const getAllPosts = async () => {
    const res = await request('/posts');
    if (!res.ok) throw new Error(res.body?.error || `Error fetching posts (status ${res.status})`);
    return res.body.posts || res.body; 
};

export const createPost = async (data) => {
    const res = await request('/posts', 'POST', data);
    if (!res.ok) throw new Error(res.body?.error || `Error creating post (status ${res.status})`);
    return res.body;
};

export const getPollOptions = async (postId) => {
  const res = await request(`/posts/${postId}/options`);
  if (!res.ok) throw new Error(res.body?.error || `Error fetching poll options (status ${res.status})`);
  return res.body.options; 
};

export const votePoll = async (postId, optionId, userId) => {
    const res = await request(`/posts/${postId}/vote`, 'POST', {
        option_id: optionId,
        user_id: userId,
    });

    if (!res.ok) throw new Error(res.body?.error || `Error submitting vote (status ${res.status})`);
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
    }));
};

export const addPostComment = async (postId, userId, comment) => {
  const res = await request(`/posts/${postId}/comments`, 'POST', { user_id: userId, comment });
  if (!res.ok) throw new Error(res.body?.error || `Failed to add comment (status ${res.status})`);
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


export default { getAllPosts, createPost,  getPollOptions, votePoll, getPostComments, addPostComment, searchPosts };