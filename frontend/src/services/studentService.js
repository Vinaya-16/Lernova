import axios from 'axios';

const API_URL = 'http://localhost:5000/api/students';

const getToken = () => localStorage.getItem('token');

export const studentService = {
    // Get all students progress for the instructor
    getStudentsProgress: async () => {
        try {
            const response = await axios.get(`${API_URL}/progress`, {
                headers: {
                    Authorization: `Bearer ${getToken()}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching students progress:', error);
            throw error;
        }
    },

    // Get a single student's progress
    getStudentProgress: async (studentId) => {
        try {
            const response = await axios.get(`${API_URL}/progress/${studentId}`, {
                headers: {
                    Authorization: `Bearer ${getToken()}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching student progress:', error);
            throw error;
        }
    },

    // Get all students in a specific course
    getCourseStudents: async (courseId) => {
        try {
            const response = await axios.get(`${API_URL}/course/${courseId}`, {
                headers: {
                    Authorization: `Bearer ${getToken()}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching course students:', error);
            throw error;
        }
    }
};