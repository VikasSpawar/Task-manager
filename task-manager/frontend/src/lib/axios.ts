// frontend/src/lib/axios.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4000',
});

// ✅ ADD THIS INTERCEPTOR
// Before sending any request, check if we have a token and attach it
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

export default api;