import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
    withCredentials: true
});

// Kept in memory, not localStorage. /auth/me refreshes it after a full-page reload.
let csrfToken = null;
export const setCsrfToken = token => { csrfToken = typeof token === "string" && token.length >= 32 ? token : null; };

api.interceptors.request.use(config => {
    const method = String(config.method || "get").toLowerCase();
    if (!["get", "head", "options"].includes(method) && csrfToken) config.headers["X-CSRF-Token"] = csrfToken;
    return config;
});

export default api;
