import Announcement from "../models/Announcement.js";
import Course from "../models/coursesModel.js";

// Create Announcement
export const createAnnouncement = async (req, res) => {
    try {
        const { title, body, course } = req.body;

        console.log('Creating announcement:', { title, body, course });
        console.log('User:', req.user._id);

        if (!title || !body || !course) {
            return res.status(400).json({
                success: false,
                message: "Title, body, and course are required"
            });
        }

        const announcement = new Announcement({
            title: title.trim(),
            body: body.trim(),
            course: course,
            createdBy: req.user._id,
        });

        const savedAnnouncement = await announcement.save();
        console.log('Announcement saved:', savedAnnouncement._id);

        res.status(201).json({
            success: true,
            announcement: savedAnnouncement,
        });
    } catch (error) {
        console.error('Error in createAnnouncement:', error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Get All Announcements
export const getAnnouncements = async (req, res) => {
    try {
        console.log('Fetching all announcements...');
        
        const announcements = await Announcement.find()
            .sort({ createdAt: -1 });
        
        console.log('Found announcements:', announcements.length);

        res.status(200).json({
            success: true,
            announcements: announcements || [],
        });
    } catch (error) {
        console.error('Error in getAnnouncements:', error);
        res.status(200).json({
            success: true,
            announcements: [],
        });
    }
};

// Get Instructor's Own Announcements - FILTER BY createdBy
export const getMyAnnouncements = async (req, res) => {
    try {
        const userId = req.user._id;
        console.log('Getting announcements for instructor:', userId);

        const announcements = await Announcement.find({
            createdBy: userId
        })
        .sort({ createdAt: -1 });
        
        console.log('Found announcements by this instructor:', announcements.length);

        res.status(200).json({
            success: true,
            announcements: announcements || [],
        });
    } catch (error) {
        console.error('Error in getMyAnnouncements:', error);
        res.status(200).json({
            success: true,
            announcements: [],
        });
    }
};

// Get announcements for a specific course
export const getCourseAnnouncements = async (req, res) => {
    try {
        const { courseId } = req.params;
        
        if (!courseId) {
            return res.status(400).json({
                success: false,
                message: "Course ID is required"
            });
        }

        const announcements = await Announcement.find({
            course: courseId,
        })
        .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            announcements: announcements || [],
        });
    } catch (error) {
        console.error('Error in getCourseAnnouncements:', error);
        res.status(200).json({
            success: true,
            announcements: [],
        });
    }
};

// Delete Announcement
export const deleteAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Announcement ID is required"
            });
        }

        const announcement = await Announcement.findById(id);

        if (!announcement) {
            return res.status(404).json({
                success: false,
                message: "Announcement not found",
            });
        }

        if (announcement.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to delete this announcement",
            });
        }

        await announcement.deleteOne();

        res.status(200).json({
            success: true,
            message: "Announcement deleted successfully",
        });
    } catch (error) {
        console.error('Error in deleteAnnouncement:', error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};