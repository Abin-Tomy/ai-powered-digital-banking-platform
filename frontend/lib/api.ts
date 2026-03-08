import axios from "axios";

// Helper to get CSRF token from cookie
function getCookie(name: string) {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return null;
}

const api = axios.create({
  baseURL: (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000") + "/api",
  withCredentials: true, // 🔑 VERY IMPORTANT (sends cookies)
});

// Add auth token and CSRF token to every request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  const csrfToken = getCookie('csrftoken');
  if (csrfToken) {
    config.headers['X-CSRFToken'] = csrfToken;
  }
  return config;
});

// Add response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem("refresh_token");
        if (!refreshToken) {
          // No refresh token, redirect to login
          localStorage.clear();
          document.cookie = "access_token=; path=/; max-age=0";
          document.cookie = "role=; path=/; max-age=0";
          window.location.href = "/login";
          return Promise.reject(error);
        }
        
        // Try to refresh token
        const response = await axios.post(
          (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000") + "/api/auth/token/refresh/",
          { refresh: refreshToken },
          { withCredentials: true }
        );
        
        const { access } = response.data;
        localStorage.setItem("access_token", access);
        document.cookie = `access_token=${access}; path=/; max-age=86400`;
        
        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
        
      } catch (refreshError) {
        // Refresh failed, clear all auth data and redirect
        localStorage.clear();
        document.cookie = "access_token=; path=/; max-age=0";
        document.cookie = "role=; path=/; max-age=0";
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;