// services/studentService.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/students';

const getToken = () => localStorage.getItem('token');

export const studentService = {
    // ============ INSTRUCTOR ROUTES ============
    
    // Get all students progress for the instructor's courses only
    getStudentsProgress: async () => {
        try {
            const response = await axios.get(`${API_URL}/progress`, {
                headers: {
                    Authorization: `Bearer ${getToken()}`
                }
            });
            console.log('Students progress response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching students progress:', error);
            throw error;
        }
    },

    // Get detailed progress for a specific student
    getStudentDetailedProgress: async (studentId) => {
        try {
            const response = await axios.get(`${API_URL}/progress/student/${studentId}`, {
                headers: {
                    Authorization: `Bearer ${getToken()}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching student details:', error);
            throw error;
        }
    },

    // ============ STUDENT ROUTES ============
    
    // Update progress when student watches a video
    updateVideoProgress: async (data) => {
        try {
            const response = await axios.post(`${API_URL}/progress/video`, data, {
                headers: {
                    Authorization: `Bearer ${getToken()}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error updating video progress:', error);
            throw error;
        }
    },

    // Get student's progress for a specific course
    getCourseProgress: async (courseId) => {
        try {
            const response = await axios.get(`${API_URL}/progress/course/${courseId}`, {
                headers: {
                    Authorization: `Bearer ${getToken()}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error getting course progress:', error);
            throw error;
        }
    },

    // Get student dashboard
    getStudentDashboard: async () => {
        try {
            const response = await axios.get(`${API_URL}/dashboard`, {
                headers: {
                    Authorization: `Bearer ${getToken()}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error getting student dashboard:', error);
            throw error;
        }
    }
};