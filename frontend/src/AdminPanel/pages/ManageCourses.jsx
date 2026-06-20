import { useEffect, useState } from "react";
import { Card, Badge, Button } from "../../components/ui";
import { courseService } from "../../services/courseService";

export default function ManageCourses() {
    const [courses, setCourses] = useState([]);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const response = await courseService.getAllCourses();
            setCourses(response.course || []);
        } catch (error) {
            console.error("Failed to fetch courses:", error);
        }
    };

    const updateCourseStatus = async (id, status) => {
        try {
            await courseService.updateCourseStatus(id, status);

            setCourses((prev) =>
                prev.map((course) =>
                    course._id === id
                        ? { ...course, status }
                        : course
                )
            );
        } catch (error) {
            console.error("Status update failed:", error);
        }
    };

    return (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {courses.map((c) => (
                <Card
                    key={c._id}
                    className="p-0 overflow-hidden flex flex-col"
                >
                    <img
                        src={c.image || "/placeholder-course.jpg"}
                        alt={c.title}
                        className="w-full h-32 object-cover"
                    />

                    <div className="p-4 flex-1 flex flex-col">
                        <Badge tone="primary">
                            {c.category}
                        </Badge>

                        <p className="text-body-lg text-text-primary mt-2">
                            {c.title}
                        </p>

                        <p className="text-caption text-text-secondary mt-1">
                            {c.instructorName?.name} ·{" "}
                            {c.studentsEnrolled || 0} students
                        </p>

                        <div className="mt-4 flex items-center justify-between">
                            <Badge
                                tone={
                                    c.status === "approved"
                                        ? "success"
                                        : c.status === "rejected"
                                        ? "danger"
                                        : "warning"
                                }
                            >
                                {c.status}
                            </Badge>
                        </div>

                        <div className="flex gap-2 mt-4">
                            {c.status !== "approved" && (
                                <Button
                                    variant="outline"
                                    className="h-8 px-3 text-xs"
                                    onClick={() =>
                                        updateCourseStatus(
                                            c._id,
                                            "approved"
                                        )
                                    }
                                >
                                    Approve
                                </Button>
                            )}

                            {c.status !== "rejected" && (
                                <Button
                                    variant="destructive"
                                    className="h-8 px-3 text-xs"
                                    onClick={() =>
                                        updateCourseStatus(
                                            c._id,
                                            "rejected"
                                        )
                                    }
                                >
                                    Reject
                                </Button>
                            )}
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
}