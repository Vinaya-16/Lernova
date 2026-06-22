import axios from "axios";

const API = "http://localhost:5000/api/reviews";

const getToken = () => localStorage.getItem("token");

const authHeader = () => ({
    headers: { Authorization: `Bearer ${getToken()}` },
});

// Student adds or updates a review
export const addReview = async (reviewData) => {
    try {
        const response = await axios.post(API, reviewData, authHeader());
        return response.data;
    } catch (error) {
        console.error("Error in addReview:", error);
        throw error;
    }
};

// Get all reviews
export const getReviews = async () => {
    try {
        const response = await axios.get(API, authHeader());
        return response.data;
    } catch (error) {
        console.error("Error in getReviews:", error);
        return { success: true, reviews: [] };
    }
};

// Instructor gets reviews for their courses
export const getInstructorReviews = async () => {
    try {
        const response = await axios.get(`${API}/instructor`, authHeader());
        return response.data;
    } catch (error) {
        console.error("Error in getInstructorReviews:", error);
        return { success: true, reviews: [] };
    }
};
