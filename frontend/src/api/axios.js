import axios from 'axios'
import store from '../store/store'
import { logout as authLogout } from '../store/authSlice'
import { clearSession } from './session'

// Backend base URL — override via env in dev/prod
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

// JWT is delivered in an httpOnly cookie, so no Authorization header is set here.
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

// Any 401 means the cookie is gone/expired: drop local auth state to match.
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      clearSession()
      store.dispatch(authLogout())
    }
    return Promise.reject(error)
  },
)

export default api
