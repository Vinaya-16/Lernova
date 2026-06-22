import axios from "axios";

const API = "http://localhost:5000/api/announcements";

const getToken = () => localStorage.getItem("token");

// Get announcements (filtered by role on backend)
export const getAnnouncements = async () => {
    try {
        const response = await axios.get(API, {
            headers: {
                Authorization: `Bearer ${getToken()}`,
            },
        });
        console.log('GET announcements response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error in getAnnouncements:', error);
        // Return empty data instead of throwing error
        return { success: true, announcements: [] };
    }
};

// Get instructor's own announcements
export const getMyAnnouncements = async () => {
    try {
        const response = await axios.get(`${API}/my-announcements`, {
            headers: {
                Authorization: `Bearer ${getToken()}`,
            },
        });
        console.log('GET my announcements response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error in getMyAnnouncements:', error);
        // Return empty data instead of throwing error
        return { success: true, announcements: [] };
    }
};

export const createAnnouncement = async (announcementData) => {
    try {
        const response = await axios.post(API, announcementData, {
            headers: {
                Authorization: `Bearer ${getToken()}`,
            },
        });
        console.log('Create announcement response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error in createAnnouncement:', error);
        // Return error response
        throw error;
    }
};

export const deleteAnnouncement = async (id) => {
    try {
        const response = await axios.delete(`${API}/${id}`, {
            headers: {
                Authorization: `Bearer ${getToken()}`,
            },
        });
        console.log('Delete announcement response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error in deleteAnnouncement:', error);
        throw error;
    }
};