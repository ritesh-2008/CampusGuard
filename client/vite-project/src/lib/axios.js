import axios from 'axios'
import { supabase } from './supabase.js'

export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Attach the Supabase session token to every request, when available
axiosInstance.interceptors.request.use(async (config) => {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`
  }

  return config
})

// Surface server-provided error messages so callers can show them directly
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ??
      (error.code === 'ERR_NETWORK'
        ? 'Could not reach the campus server. Please check your connection.'
        : error.message)

    error.message = message
    return Promise.reject(error)
  }
)

export default axiosInstance
