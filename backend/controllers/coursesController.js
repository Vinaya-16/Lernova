import coursesModel from "../models/coursesModel.js";

export const createCourse = async (req, res) => {
    try {
        const courseData = {
            ...req.body,
            instructorId: req.user.id,
            status: "pending",
            complexity: "Beginner",
        };

        const course = await coursesModel.create(courseData);

        res.status(201).json({
            success: true,
            course,
        });
    }
    catch (error) {
        console.error("Error on creating course", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getMyCourse = async (req, res) => {
    try {
        const course = await coursesModel.find({ instructorId: req.user.id });

        res.status(201).json({
            success: true,
            course,
        });
    }
    catch (error) {
        console.error("error on getting my courses");
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const updateCourse = async (req, res) => {
    try {
        const course = await coursesModel.findById(req.params.id);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "No such course to update"
            });
        }

        if (course.instructorId && course.instructorId.toString() != req.user.id.toString()) {
            console.log("Permission Denied");
            console.log("Unauthorized Updation Detected !!");
            return res.status(201).json({
                success: false,
                message: "You can Update only your courses",
            });
        }

        const updateCourse = await coursesModel.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.status(201).json({
            success: true,
            updateCourse,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const deleteCourse = async (req, res) => {
    try {
        const course = await coursesModel.findById(req.params.id);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "No such course to delete"
            });
        }

        if (course.instructorId && course.instructorId.toString() != req.user.id.toString()) {
            console.log("Permission Denied");
            console.log("Unauthorized Updation Detected !!");
            return res.status(403).json({
                success: false,
                message: "You can Delete only your courses",
            });
        }

        await coursesModel.findByIdAndDelete(req.params.id);

        res.status(201).json({
            success: true,
            course,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Students Panel
export const getCourses = async (req, res) => {
    try {
        const course = await coursesModel.find({ status: "approved" });

        res.status(201).json({
            success: true,
            course,
        });
    }
    catch (error) {
        console.error("Not Getting approved courses");
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

//Admin panel

export const getAllCourses = async (req, res) => {
    try {
        const courses = await coursesModel.find();

        res.status(200).json({
            success: true,
            course: courses,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const updateCourseStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const course = await coursesModel.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found",
            });
        }

        res.status(200).json({
            success: true,
            course,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};