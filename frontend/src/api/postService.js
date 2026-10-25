import api from './axios'

// Posts
export const getPosts = (params) => api.get('/posts', { params })
export const getPost = (slug) => api.get(`/posts/${slug}`)
export const createPost = (data) => api.post('/posts', data)
export const updatePost = (slug, data) => api.put(`/posts/${slug}`, data)
export const deletePost = (slug) => api.delete(`/posts/${slug}`)
export const getMyPosts = () => api.get('/posts/me')

// Cloudinary upload (multipart form-data)
export const uploadImage = (formData) =>
  api.post('/cloudinary/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })