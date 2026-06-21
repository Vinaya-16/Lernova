import axios from "axios";
import { API_BASE_URL } from "../config/api.js";

// Use centralized API base URL so this works in both dev and production (Vercel, etc.)
const API = `${API_BASE_URL}/announcements`;

const getToken = () => localStorage.getItem("token");

const authHeaders = () => ({
    Authorization: `Bearer ${getToken()}`,
});

export const getAnnouncements = async () => {
    try {
        const { data } = await axios.get(API, { headers: authHeaders() });
        return data;
    } catch (error) {
        console.error("Error in getAnnouncements:", error.response || error);
        throw error;
    }
};

export const createAnnouncement = async (announcementData) => {
    try {
        const { data } = await axios.post(API, announcementData, { headers: authHeaders() });
        return data;
    } catch (error) {
        console.error("Error in createAnnouncement:", error.response || error);
        throw error;
    }
};

export const deleteAnnouncement = async (id) => {
    try {
        const { data } = await axios.delete(`${API}/${id}`, { headers: authHeaders() });
        return data;
    } catch (error) {
        console.error("Error in deleteAnnouncement:", error.response || error);
        throw error;
    }
};