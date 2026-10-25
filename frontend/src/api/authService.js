import api from './axios'

// Auth: register, login, logout, getMe, updateProfile
export const register = (data) => api.post('/users/register', data)
export const login = (data) => api.post('/users/login', data)
export const logout = () => api.post('/users/logout')
export const getMe = () => api.get('/users/me')
export const updateProfile = (data) => api.put('/users/me', data)
