// services/assignmentService.js
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

export const assignmentService = {
  createAssignment: async (assignmentData) => {
    try {
      const response = await api.post('/assignments', assignmentData);
      return response.data;
    } catch (error) {
      console.error('Error creating assignment:', error.response?.data || error.message);
      throw error;
    }
  },

  getMyAssignments: async () => {
    try {
      const response = await api.get('/assignments/my');
      return response.data;
    } catch (error) {
      console.error('Error fetching assignments:', error.response?.data || error.message);
      throw error;
    }
  },

  updateAssignment: async (id, assignmentData) => {
    try {
      const response = await api.put(`/assignments/${id}`, assignmentData);
      return response.data;
    } catch (error) {
      console.error('Error updating assignment:', error.response?.data || error.message);
      throw error;
    }
  },

  deleteAssignment: async (id) => {
    try {
      const response = await api.delete(`/assignments/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting assignment:', error.response?.data || error.message);
      throw error;
    }
  },

  getAssignmentSubmissions: async (assignmentId) => {
    try {
      const response = await api.get(`/assignments/${assignmentId}/submissions`);
      return response.data;
    } catch (error) {
      console.error('Error fetching submissions:', error.response?.data || error.message);
      throw error;
    }
  },

  gradeSubmission: async (submissionId, gradeData) => {
    try {
      const response = await api.put(`/submissions/${submissionId}/grade`, gradeData);
      return response.data;
    } catch (error) {
      console.error('Error grading submission:', error.response?.data || error.message);
      throw error;
    }
  },

  getStudentAssignments: async () => {
    try {
      const response = await api.get('/assignments/student');
      return response.data;
    } catch (error) {
      console.error('Error fetching student assignments:', error.response?.data || error.message);
      throw error;
    }
  },

  submitAssignment: async (submissionData) => {
    try {
      const response = await api.post('/submissions', submissionData);
      return response.data;
    } catch (error) {
      console.error('Error submitting assignment:', error.response?.data || error.message);
      throw error;
    }
  },

  getMySubmissions: async () => {
    try {
      const response = await api.get('/submissions/my');
      return response.data;
    } catch (error) {
      console.error('Error fetching student submissions:', error.response?.data || error.message);
      throw error;
    }
  }
};