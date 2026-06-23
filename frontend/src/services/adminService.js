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

  /**
   * Fetches all students (admin view).
   * Optional search query filters by name or email.
   */
  getAllStudents: async (search = "") => {
    try {
      const response = await api.get("/admin/students", {
        params: search ? { search } : {},
      });
      return response.data;
    } catch (error) {
      console.error(
        "Error fetching students:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  /**
   * Deletes a student and all their enrollments by ID.
   */
  deleteStudent: async (id) => {
    try {
      const response = await api.delete(`/admin/students/${id}`);
      return response.data;
    } catch (error) {
      console.error(
        "Error deleting student:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  /**
   * Fetches enrollment report (per-course details and summaries).
   */
  getEnrollmentReport: async () => {
    try {
      const response = await api.get("/admin/enrollment-report");
      return response.data;
    } catch (error) {
      console.error(
        "Error fetching enrollment report:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
};
