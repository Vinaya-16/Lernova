// services/courseService.js
import axios from 'axios';

const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('Making request to:', config.url);
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    console.log('Response:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.status, error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const courseService = {
  createCourse: async (courseData) => {
    try {
      const response = await api.post('/courses/createCourse', courseData);
      return response.data;
    } catch (error) {
      console.error('Error creating course:', error.response?.data || error.message);
      throw error;
    }
  },

  getCourses: async () => {
    try {
      const response = await api.get('/courses/courses');
      return response.data;
    } catch (error) {
      console.error('Error fetching courses:', error.response?.data || error.message);
      throw error;
    }
  },

  getMyCourses: async () => {
    try {
      const response = await api.get('/courses/course');
      return response.data;
    } catch (error) {
      console.error('Error fetching your courses:', error.response?.data || error.message);
      throw error;
    }
  },

  updateCourse: async (id, courseData) => {
    try {
      const response = await api.put(`/courses/updateCourse/${id}`, courseData);
      return response.data;
    } catch (error) {
      console.error('Error updating course:', error.response?.data || error.message);
      throw error;
    }
  },

  deleteCourse: async (id) => {
    try {
      const response = await api.delete(`/courses/deleteCourse/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting course:', error.response?.data || error.message);
      throw error;
    }
  },

  updateCourseStatus: async (id, status) => {
    try {
      const response = await api.put(`/courses/updateCourseStatus/${id}`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating course status:', error.response?.data || error.message);
      throw error;
    }
  },

  getAllCourses: async () => {
    try {
      const response = await api.get('/courses/allCourses');
      return response.data;
    } catch (error) {
      console.error('Error fetching all courses:', error.response?.data || error.message);
      throw error;
    }
  },

  uploadVideo: async (courseId, formData, onProgress) => {
    try {
      const response = await api.post(
        `/courses/${courseId}/videos`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            if (onProgress) onProgress(percent);
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error uploading video:", error.response?.data || error.message);
      throw error;
    }
  },

  getVideos: async (courseId) => {
    try {
      const response = await api.get(`/courses/${courseId}/videos`);
      return response.data;
    } catch (error) {
      console.error("Error fetching videos:", error.response?.data || error.message);
      throw error;
    }
  },

  deleteVideo: async (courseId, videoId) => {
    try {
      const response = await api.delete(`/courses/${courseId}/videos/${videoId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting video:", error.response?.data || error.message);
      throw error;
    }
  },

};