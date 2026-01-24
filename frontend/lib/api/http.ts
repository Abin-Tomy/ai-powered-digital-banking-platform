import axios from "axios";

const http = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL + "/api",
  withCredentials: true,
});

export default http;
