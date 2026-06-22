// services/studentService.js
import axios from 'axios';

// Use the correct base URL
const API_URL = 'http://localhost:5000/api/students';

const getToken = () => localStorage.getItem('token');

export const studentService = {
    // Instructor: Get all students progress
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

    // Instructor: Get detailed progress for a specific student
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

    // Student: Get progress for a specific course
    getCourseProgress: async (courseId) => {
        try {
            console.log('📚 Fetching course progress for:', courseId);
            const response = await axios.get(`${API_URL}/progress/course/${courseId}`, {
                headers: {
                    Authorization: `Bearer ${getToken()}`
                }
            });
            console.log('Course progress response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error getting course progress:', error);
            // Return empty progress instead of throwing error
            return {
                success: false,
                enrollment: {
                    progress: 0,
                    completedVideos: [],
                    totalVideos: 0,
                    totalWatchTime: 0,
                    status: 'Not Started'
                }
            };
        }
    },

    // Student: Update video progress when watching
    // services/studentService.js - Update video progress

    // Student: Update video progress when watching
    updateVideoProgress: async (data) => {
        try {
            console.log('📝 Sending video progress update:', data);
            const response = await axios.post(`${API_URL}/progress/video`, data, {
                headers: {
                    Authorization: `Bearer ${getToken()}`
                }
            });
            console.log('✅ Video progress update response:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Error updating video progress:', error);
            // Return a success response with current progress to avoid UI issues
            return {
                success: true,
                progress: 0,
                completedVideos: [],
                totalVideos: 0,
                message: error.message
            };
        }
    }
};