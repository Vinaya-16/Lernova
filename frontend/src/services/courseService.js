import axios from 'axios';

// Use relative path when using proxy
const API_URL = '/api'; // This will work with Vite proxy

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('Making request to:', config.url); // Debug log
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for debugging
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
  }
};