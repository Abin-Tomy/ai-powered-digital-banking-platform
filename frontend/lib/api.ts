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
  baseURL: "http://localhost:8000/api",
  withCredentials: true, // 🔑 VERY IMPORTANT (sends cookies)
});

// Add CSRF token to every request
api.interceptors.request.use((config) => {
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
          "http://localhost:8000/api/auth/token/refresh/",
          { refresh: refreshToken },
          { withCredentials: true }
        );
        
        const { access } = response.data;
        localStorage.setItem("access_token", access);
        
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