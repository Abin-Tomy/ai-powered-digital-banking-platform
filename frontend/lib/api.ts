import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  withCredentials: true, // 🔑 VERY IMPORTANT (sends cookies)
});

export default api;