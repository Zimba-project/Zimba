const API_BASE = process.env.API_BASE
async function request(path, method = 'GET', body) {
    const opts = { method, headers: { 'Content-Type': 'application/json' } };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(`${API_BASE}${path}`, opts);
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

export default { getAllPosts, createPost };