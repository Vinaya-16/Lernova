import axios from "axios";

const API_URL = "/api";

const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export const instructorService = {
    getInstructors: async () => {
        const response = await api.get(
            "/instructors/allInstructors"
        );

        return response.data;
    },

    updateInstructorStatus: async (id, status) => {
        const response = await api.put(
            `/instructors/updateInstructorStatus/${id}`,
            { status }
        );

        return response.data;
    },
};