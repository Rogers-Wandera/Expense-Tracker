import axios from "axios";
import { baseUrl } from "./endpoints";

const api = axios.create({
  baseURL: baseUrl,
  withCredentials: true,
});

export default api;
