import { sessionStorage } from '../utils/Storage';

export const uploadImage = async (imageUri) => {
  if (!imageUri) return null;

  try {
    const token = await sessionStorage.getItem('authToken'); // get user token
    if (!token) throw new Error('User not authenticated');

    const filename = imageUri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      type,
      name: filename,
    });

    const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE}/upload`, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`, // send token
      },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Upload failed: ${response.status} ${text}`);
    }

    const json = await response.json();
    return json.url;
  } catch (error) {
    console.error('Image upload error:', error);
    throw new Error(error.message || 'Failed to upload image');
  }
};
