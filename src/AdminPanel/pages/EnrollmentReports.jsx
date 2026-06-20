import { Card, ProgressBar } from "../../components/ui";
import { courses } from "../../mockData/lmsData";

export default function EnrollmentReports() {
    const maxStudents = Math.max(...courses.map((c) => c.students));
    return (
        <Card>
            <h3 className="text-h3 text-text-primary mb-6">Enrollment by Course</h3>
            <div className="space-y-5">
                {courses.map((c) => (
                    <div key={c.id}>
                        <div className="flex items-center justify-between mb-1.5">
                            <p className="text-body text-text-primary">{c.title}</p>
                            <p className="text-caption text-text-secondary">{c.students.toLocaleString()} enrolled</p>
                        </div>
                        <ProgressBar value={(c.students / maxStudents) * 100} />
                    </div>
                ))}
            </div>
        </Card>
    );
}
