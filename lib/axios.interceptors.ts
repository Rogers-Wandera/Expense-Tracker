import axios from "axios";

const api = axios.create({
  // baseURL: baseUrl,
  baseURL: "/api",
  withCredentials: true,
});

export default api;
