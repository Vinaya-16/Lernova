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
      // Your route: POST /api/courses/createCourse
      const response = await api.post('/courses/createCourse', courseData);
      return response.data;
    } catch (error) {
      console.error('Error creating course:', error.response?.data || error.message);
      throw error;
    }
  },

  getCourses: async () => {
    try {
      // Your route: GET /api/courses/courses
      const response = await api.get('/courses/courses');
      return response.data;
    } catch (error) {
      console.error('Error fetching courses:', error.response?.data || error.message);
      throw error;
    }
  },

  getMyCourses: async () => {
    try {
      // Your route: GET /api/courses/course (singular)
      const response = await api.get('/courses/course');
      return response.data;
    } catch (error) {
      console.error('Error fetching your courses:', error.response?.data || error.message);
      throw error;
    }
  },

  updateCourse: async (id, courseData) => {
    try {
      // Your route: PUT /api/courses/updateCourse/:id
      const response = await api.put(`/courses/updateCourse/${id}`, courseData);
      return response.data;
    } catch (error) {
      console.error('Error updating course:', error.response?.data || error.message);
      throw error;
    }
  },

  deleteCourse: async (id) => {
    try {
      // Your route: DELETE /api/courses/deleteCourse/:id
      const response = await api.delete(`/courses/deleteCourse/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting course:', error.response?.data || error.message);
      throw error;
    }
  },

  updateCourseStatus: async (id, status) => {
    try {
      // Your route: PUT /api/courses/updateCourseStatus/:id
      const response = await api.put(`/courses/updateCourseStatus/${id}`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating course status:', error.response?.data || error.message);
      throw error;
    }
  },

  getAllCourses: async () => {
    try {
      // Your route: GET /api/courses/allCourses
      const response = await api.get('/courses/allCourses');
      return response.data;
    } catch (error) {
      console.error('Error fetching all courses:', error.response?.data || error.message);
      throw error;
    }
  },
};