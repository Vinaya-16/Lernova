import Announcement from "../models/Announcement.js";

// Create Announcement
export const createAnnouncement =
    async (req, res) => {
        try {
            const {
                title,
                body,
                course,
            } = req.body;

            const announcement =
                await Announcement.create({
                    title,
                    body,
                    course,
                    createdBy:
                        req.user._id,
                });

            res.status(201).json({
                success: true,
                announcement,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message:
                    error.message,
            });
        }
    };

// Get All Announcements
export const getAnnouncements =
    async (req, res) => {
        try {
            const announcements =
                await Announcement.find()
                    .populate(
                        "course",
                        "title"
                    )
                    .sort({
                        createdAt: -1,
                    });

            res.status(200).json({
                success: true,
                announcements,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    };

// Delete Announcement
export const deleteAnnouncement =
    async (req, res) => {
        try {
            const announcement =
                await Announcement.findById(
                    req.params.id
                );

            if (!announcement) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Announcement not found",
                });
            }

            await announcement.deleteOne();

            res.status(200).json({
                success: true,
                message:
                    "Announcement deleted",
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    };

export const getCourseAnnouncements =
    async (req, res) => {
        try {
            const announcements =
                await Announcement.find({
                    course:
                        req.params
                            .courseId,
                }).sort({
                    createdAt: -1,
                });

            res.status(200).json({
                success: true,
                announcements,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message:
                    error.message,
            });
        }
    };