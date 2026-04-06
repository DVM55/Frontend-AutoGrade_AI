import axios from "axios";

const api = axios.create({
  baseURL: "https://assists-willing-sperm-wholesale.trycloudflare.com/api/v1",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ===============================
// REQUEST INTERCEPTOR
// ===============================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ===============================
// RESPONSE INTERCEPTOR
// ===============================

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

// Hàm logout không dùng window.location để tránh reload loop
const forceLogout = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  // Dùng navigate của React thay vì window.location
  // Dispatch event để AuthContext lắng nghe
  window.dispatchEvent(new Event("force-logout"));
};

api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    // Không phải lỗi 401 → bỏ qua
    if (!error.response || error.response.status !== 401) {
      return Promise.reject(error);
    }

    // Các route public → không refresh
    if (
      originalRequest.url.includes("/auth/login") ||
      originalRequest.url.includes("/auth/register") ||
      originalRequest.url.includes("/auth/refresh-accessToken") // ← quan trọng!
    ) {
      return Promise.reject(error);
    }

    // Đã retry rồi mà vẫn 401 → logout
    if (originalRequest._retry) {
      forceLogout();
      return Promise.reject(error);
    }

    // Đang refresh → đẩy vào queue chờ
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    // Bắt đầu refresh token
    originalRequest._retry = true;
    isRefreshing = true;

    const refreshToken = localStorage.getItem("refresh_token");

    if (!refreshToken) {
      isRefreshing = false;
      forceLogout();
      return Promise.reject(error);
    }

    try {
      const res = await axios.post(
        "http://localhost:8080/api/v1/auth/refresh-accessToken",
        { refreshToken },
      );

      const { accessToken, refreshToken: newRefreshToken } = res.data.data;
      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("refresh_token", newRefreshToken);

      api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
      processQueue(null, accessToken);

      if (originalRequest.method.toUpperCase() === "GET") {
        originalRequest.data = undefined;
      }

      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return api(originalRequest);
    } catch (err) {
      processQueue(err, null);
      forceLogout();
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  },
);

export default api;
