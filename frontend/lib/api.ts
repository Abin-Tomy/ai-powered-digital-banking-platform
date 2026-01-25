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

export default api;