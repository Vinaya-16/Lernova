import axios from "axios";

const API_URL = "/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

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

export const certificateService = {
  generateCertificate: async ({ studentId, courseId }) => {
    try {
      const response = await api.post("/certificates/generate", { studentId, courseId });
      return response.data;
    } catch (error) {
      console.error("Error generating certificate:", error.response?.data || error.message);
      throw error;
    }
  },

  getCertificateById: async (certificateId) => {
    try {
      const response = await api.get(`/certificates/${certificateId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching certificate:", error.response?.data || error.message);
      throw error;
    }
  },

  getCertificatesByStudent: async (studentId) => {
    try {
      const response = await api.get(`/certificates/student/${studentId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching student certificates:", error.response?.data || error.message);
      throw error;
    }
  },
};