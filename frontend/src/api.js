import axios from 'axios'
import Auth from './Auth'

const api = axios.create({ baseURL: 'http://localhost:4000/api' })

api.interceptors.request.use(async (cfg) => {
  try {
    const token = await Auth.getAccessToken()
    if (token) cfg.headers.Authorization = `Bearer ${token}`
  } catch (e) {
    console.error('Failed to get access token:', e)
  }
  return cfg
})

export default api
