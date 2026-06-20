import { MessageSquare, Flag } from "lucide-react";
import { Card, Badge, Button, Avatar } from "../../components/ui";
import { discussions } from "../../mockData/lmsData";

export default function DiscussionModeration() {
    return (
        <div className="space-y-4">
            {discussions.map((d) => (
                <Card key={d.id} className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                        <Avatar name={d.author} size={36} />
                        <div>
                            <p className="text-body-lg text-text-primary flex items-center gap-2">
                                <MessageSquare size={15} className="text-primary" /> {d.title}
                            </p>
                            <p className="text-caption text-text-secondary">{d.course} · by {d.author} · {d.replies} replies</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge tone="neutral">No reports</Badge>
                        <Button variant="outline" className="h-9 px-4"><Flag size={14} /> Review</Button>
                    </div>
                </Card>
            ))}
        </div>
    );
}
