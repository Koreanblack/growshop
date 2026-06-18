import axios from "axios";

export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({
  baseURL: API,
  withCredentials: true,
});

// attach admin JWT if present
api.interceptors.request.use((config) => {
  const adminToken = localStorage.getItem("admin_token");
  if (adminToken && (config.url || "").includes("/admin/")) {
    config.headers.Authorization = `Bearer ${adminToken}`;
  }
  return config;
});

export const formatARS = (n) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
  }).format(Number(n || 0));
