import { Award } from "lucide-react";
import { Card, Badge } from "../../components/ui";
import { certificates, students } from "../../mockData/lmsData";

const issued = certificates.map((c, i) => ({ ...c, student: students[i % students.length].name }));

export default function CertificateManagement() {
    return (
        <Card className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[560px]">
                <thead>
                    <tr className="text-caption text-text-secondary border-b border-border-light">
                        <th className="py-3 pr-4">Credential ID</th>
                        <th className="py-3 pr-4">Student</th>
                        <th className="py-3 pr-4">Course</th>
                        <th className="py-3 pr-4">Issued On</th>
                        <th className="py-3 pr-4">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {issued.map((c) => (
                        <tr key={c.id} className="border-b border-border-light last:border-0">
                            <td className="py-3 pr-4 text-text-primary flex items-center gap-2"><Award size={15} className="text-primary" /> {c.credentialId}</td>
                            <td className="py-3 pr-4 text-text-secondary">{c.student}</td>
                            <td className="py-3 pr-4 text-text-secondary">{c.course}</td>
                            <td className="py-3 pr-4 text-text-secondary">{c.issuedOn}</td>
                            <td className="py-3 pr-4"><Badge tone="success">Issued</Badge></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </Card>
    );
}
