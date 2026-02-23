import axios from "axios";
import { useAuthStore } from "../store/authStore";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 15000,
});

// Attach token to every request
client.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 — try refresh once, then logout
let isRefreshing = false;
let queue = [];

const processQueue = (error, token = null) => {
  queue.forEach((prom) => (error ? prom.reject(error) : prom.resolve(token)));
  queue = [];
};

client.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;

    if (err.response?.status === 401 && err.response?.data?.code === "TOKEN_EXPIRED" && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return client(original);
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = useAuthStore.getState().refreshToken;
        const { data } = await axios.post("/api/auth/refresh", { refreshToken });
        useAuthStore.getState().setToken(data.token);
        processQueue(null, data.token);
        original.headers.Authorization = `Bearer ${data.token}`;
        return client(original);
      } catch (refreshErr) {
        processQueue(refreshErr);
        useAuthStore.getState().logout();
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(err);
  }
);

export default client;
