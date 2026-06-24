import axios from "axios";
import { API_BASE_URL } from "../config/api.js";

const API = `${API_BASE_URL}/discussions`;

const getToken = () => localStorage.getItem("token");

const authHeader = () => ({
    headers: { Authorization: `Bearer ${getToken()}` },
});

// Student asks a question
export const askQuestion = async (questionData) => {
    try {
        const response = await axios.post(API, questionData, authHeader());
        return response.data;
    } catch (error) {
        console.error("Error in askQuestion:", error);
        throw error;
    }
};

// Student gets their discussions
export const getStudentDiscussions = async () => {
    try {
        const response = await axios.get(`${API}/student`, authHeader());
        return response.data;
    } catch (error) {
        console.error("Error in getStudentDiscussions:", error);
        return { success: true, discussions: [] };
    }
};

// Instructor gets discussions for their courses
export const getInstructorDiscussions = async () => {
    try {
        const response = await axios.get(`${API}/instructor`, authHeader());
        return response.data;
    } catch (error) {
        console.error("Error in getInstructorDiscussions:", error);
        return { success: true, discussions: [] };
    }
};

// Instructor answers a question
export const answerQuestion = async (id, answerData) => {
    try {
        const response = await axios.put(`${API}/${id}/answer`, answerData, authHeader());
        return response.data;
    } catch (error) {
        console.error("Error in answerQuestion:", error);
        throw error;
    }
};
