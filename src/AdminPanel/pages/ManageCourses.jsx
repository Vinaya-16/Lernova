import { Card, Badge, Button } from "../../components/ui";
import { courses } from "../../mockData/lmsData";

export default function ManageCourses() {
    return (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {courses.map((c) => (
                <Card key={c.id} className="p-0 overflow-hidden flex flex-col">
                    <img src={c.thumbnail} alt={c.title} className="w-full h-32 object-cover" />
                    <div className="p-4 flex-1 flex flex-col">
                        <Badge tone="primary">{c.category}</Badge>
                        <p className="text-body-lg text-text-primary mt-2 line-clamp-2">{c.title}</p>
                        <p className="text-caption text-text-secondary mt-1">{c.instructor} · {c.students.toLocaleString()} students</p>
                        <div className="flex items-center justify-between mt-4">
                            <Badge tone="success">Published</Badge>
                            <Button variant="outline" className="h-8 px-3 text-xs">Manage</Button>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
}
