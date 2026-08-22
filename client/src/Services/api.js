import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // required — the backend authenticates via an HTTP-only cookie, not a header
});

/* ---------------- Auth ---------------- */
export const authAPI = {
  register: (data) => api.post("/auth/register", data), // { fullName, username, email, password }
  login: (data) => api.post("/auth/login", data), // { email, password }
  getMe: () => api.get("/auth/me"),
  logout: () => api.post("/auth/logout"),
  updateMe: (formData) => api.patch("/auth/me", formData, { headers: { "Content-Type": undefined } }),
};

// Other feature groups (videoAPI, likeAPI, historyAPI, playlistAPI,
// subscriptionAPI, commentAPI) intentionally left untouched in this phase —
// they still point at mock/localStorage services elsewhere in the app and
// are migrated one at a time in later phases.

export default api;
