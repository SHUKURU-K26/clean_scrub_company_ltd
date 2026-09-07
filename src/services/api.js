import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const accessToken = useAuthStore.getState().accessToken;
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      return Promise.reject(new Error('Cannot reach the server — is the backend running?'));
    }

    // Auth-flow endpoints (login, signup, OTP steps) handle their own 401s
    // inline — e.g. "invalid code" or "session expired" shown right on the
    // form. Force-redirecting here would silently bounce someone mid-signup
    // with no explanation, which is exactly what happened.
    const isAuthFlowRequest = error.config?.url?.startsWith('/auth/');

    if (error.response.status === 401 && !isAuthFlowRequest) {
      useAuthStore.getState().logout();
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    const detail = error.response?.data?.detail;
    const message = typeof detail === 'string' ? detail : 'Something went wrong. Please try again.';
    return Promise.reject(new Error(message));
  }
);

export default api;