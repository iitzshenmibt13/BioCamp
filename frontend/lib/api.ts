/**
 * Axios API client with automatic JWT header injection.
 */
import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export const api = axios.create({ baseURL: BASE_URL, timeout: 15000 });

api.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        const token = localStorage.getItem("camp_ops_jwt");
        if (token) {
            config.headers["Authorization"] = `Bearer ${token}`;
        }
    }
    return config;
});

api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            if (typeof window !== "undefined") {
                localStorage.removeItem("camp_ops_jwt");
                localStorage.removeItem("camp_ops_user");
            }
        }
        return Promise.reject(err);
    }
);
