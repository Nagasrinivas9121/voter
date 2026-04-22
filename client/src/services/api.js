import axios from "axios";
import toast from "react-hot-toast";

const BASE_URL = import.meta.env.VITE_API_URL || "";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
  withCredentials: false,
});

// ─── Request Interceptor — attach JWT ──────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("elected_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor — handle errors globally ─────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message;

    if (status === 401) {
      localStorage.removeItem("elected_token");
      localStorage.removeItem("elected_user");
      if (!window.location.pathname.includes("/")) {
        window.location.href = "/";
      }
    } else if (status === 429) {
      toast.error("Too many requests. Please slow down.");
    } else if (status >= 500) {
      toast.error("Server error. Please try again.");
    }

    return Promise.reject(error);
  }
);

// ─── Auth API ───────────────────────────────────────────────
export const authAPI = {
  googleLogin: (idToken, userType) =>
    api.post("/api/auth/google", { idToken, userType }),
  verify: () => api.get("/api/auth/verify"),
  updateProfile: (data) => api.patch("/api/auth/profile", data),
  logout: () => api.post("/api/auth/logout"),
};

// ─── Chat API ───────────────────────────────────────────────
export const chatAPI = {
  sendMessage: (data) => api.post("/api/chat/send", data),
  getSessions: (page = 1, limit = 10) =>
    api.get(`/api/chat/sessions?page=${page}&limit=${limit}`),
  getSession: (id) => api.get(`/api/chat/session/${id}`),
  deleteSession: (id) => api.delete(`/api/chat/session/${id}`),
};

// ─── Timeline API ───────────────────────────────────────────
export const timelineAPI = {
  getAll: () => api.get("/api/timeline"),
  getPhase: (id) => api.get(`/api/timeline/${id}`),
};

// ─── Eligibility API ────────────────────────────────────────
export const eligibilityAPI = {
  check: (data) => api.post("/api/eligibility/check", data),
};

// ─── Dashboard API ──────────────────────────────────────────
export const dashboardAPI = {
  getOverview: () => api.get("/api/dashboard/overview"),
  getActivity: (days = 7) => api.get(`/api/dashboard/activity?days=${days}`),
};

// ─── Admin API ──────────────────────────────────────────────
export const adminAPI = {
  getStats: () => api.get("/api/admin/stats"),
  getFAQs: (params) => api.get("/api/admin/faqs", { params }),
  createFAQ: (data) => api.post("/api/admin/faqs", data),
  updateFAQ: (id, data) => api.put(`/api/admin/faqs/${id}`, data),
  deleteFAQ: (id) => api.delete(`/api/admin/faqs/${id}`),
  getElectionInfo: () => api.get("/api/admin/election-info"),
  upsertElectionInfo: (data) => api.post("/api/admin/election-info", data),
};

export default api;
