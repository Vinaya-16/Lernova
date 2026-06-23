// services/adminService.js
import axios from "axios";

const API_URL = "/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token if present (optional — dashboard endpoint is public)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const adminService = {
  /**
   * Fetches all dashboard overview stats:
   *  totalUsers, totalCourses, activeEnrollments,
   *  completionRate, monthlyGrowth[], topInstructors[]
   */
  getDashboardStats: async () => {
    try {
      const response = await api.get("/admin/dashboard");
      return response.data;
    } catch (error) {
      console.error(
        "Error fetching dashboard stats:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
};
