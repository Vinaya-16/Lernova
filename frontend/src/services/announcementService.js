import axios from "axios";

const API = "http://localhost:5000/api/announcements";

const getToken = () => localStorage.getItem("token");

export const getAnnouncements = async () => {
    try {
        const { data } = await axios.get(API, {
            headers: {
                Authorization: `Bearer ${getToken()}`,
            },
        });
        console.log('GET announcements response:', data); // Debug log
        return data;
    } catch (error) {
        console.error('Error in getAnnouncements:', error.response || error);
        throw error;
    }
};

export const createAnnouncement = async (announcementData) => {
    try {
        const { data } = await axios.post(API, announcementData, {
            headers: {
                Authorization: `Bearer ${getToken()}`,
            },
        });
        console.log('Create announcement response:', data); // Debug log
        return data;
    } catch (error) {
        console.error('Error in createAnnouncement:', error.response || error);
        throw error;
    }
};

export const deleteAnnouncement = async (id) => {
    try {
        const { data } = await axios.delete(`${API}/${id}`, {
            headers: {
                Authorization: `Bearer ${getToken()}`,
            },
        });
        console.log('Delete announcement response:', data); // Debug log
        return data;
    } catch (error) {
        console.error('Error in deleteAnnouncement:', error.response || error);
        throw error;
    }
};