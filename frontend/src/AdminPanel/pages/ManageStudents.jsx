import { useState, useEffect, useCallback } from "react";
import { Search, MoreVertical, Trash2, X, AlertTriangle } from "lucide-react";
import { Card, Badge } from "../../components/ui";
import { adminService } from "../../services/adminService";

// ── Skeleton row ──────────────────────────────────────────────────────────────
function SkeletonRow() {
    return (
        <tr className="border-b border-border-light">
            {[...Array(5)].map((_, i) => (
                <td key={i} className="py-3 pr-4">
                    <div className="h-4 rounded bg-surface-secondary animate-pulse w-3/4" />
                </td>
            ))}
            <td className="py-3 pr-4">
                <div className="h-4 w-4 rounded bg-surface-secondary animate-pulse" />
            </td>
        </tr>
    );
}

// ── Delete Confirmation Modal ─────────────────────────────────────────────────
function DeleteModal({ student, onConfirm, onCancel, deleting }) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={(e) => e.target === e.currentTarget && onCancel()}
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                            <AlertTriangle size={20} className="text-red-500" />
                        </div>
                        <div>
                            <h3 className="text-body-lg text-text-primary font-semibold">
                                Delete Student
                            </h3>
                            <p className="text-caption text-text-secondary mt-0.5">
                                This action cannot be undone.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onCancel}
                        className="text-text-secondary hover:text-text-primary transition-colors"
                        disabled={deleting}
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <p className="text-body text-text-secondary">
                    Are you sure you want to permanently delete{" "}
                    <span className="font-semibold text-text-primary">{student.name}</span>?
                    <br />
                    All their enrollments will also be removed.
                </p>

                {/* Actions */}
                <div className="flex gap-3 justify-end">
                    <button
                        onClick={onCancel}
                        disabled={deleting}
                        className="px-4 py-2 rounded-lg border border-border-light text-sm font-medium text-text-secondary hover:bg-surface-secondary transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={deleting}
                        className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-60 flex items-center gap-2"
                    >
                        {deleting ? (
                            <>
                                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                Deleting…
                            </>
                        ) : (
                            <>
                                <Trash2 size={14} />
                                Delete Student
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Action Menu ───────────────────────────────────────────────────────────────
function ActionMenu({ student, onDelete }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="relative">
            <button
                onClick={() => setOpen((p) => !p)}
                className="p-1 rounded hover:bg-surface-secondary transition-colors text-text-secondary"
                title="Actions"
            >
                <MoreVertical size={16} />
            </button>

            {open && (
                <>
                    {/* Backdrop to close */}
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setOpen(false)}
                    />
                    <div className="absolute right-0 top-8 z-20 bg-white border border-border-light rounded-xl shadow-lg py-1 w-36">
                        <button
                            onClick={() => { setOpen(false); onDelete(student); }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                        >
                            <Trash2 size={14} />
                            Delete
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ManageStudents() {
    const [students, setStudents]         = useState([]);
    const [loading, setLoading]           = useState(true);
    const [error, setError]               = useState(null);
    const [query, setQuery]               = useState("");
    const [search, setSearch]             = useState(""); // debounced
    const [toDelete, setToDelete]         = useState(null);
    const [deleting, setDeleting]         = useState(false);
    const [deleteError, setDeleteError]   = useState(null);

    // ── Debounce search input ──────────────────────────────────────────────
    useEffect(() => {
        const t = setTimeout(() => setSearch(query), 350);
        return () => clearTimeout(t);
    }, [query]);

    // ── Fetch students ─────────────────────────────────────────────────────
    const fetchStudents = useCallback(async (searchTerm = "") => {
        try {
            setLoading(true);
            setError(null);
            const res = await adminService.getAllStudents(searchTerm);
            setStudents(res.students || []);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load students.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchStudents(search); }, [search, fetchStudents]);

    // ── Delete flow ────────────────────────────────────────────────────────
    const handleDeleteConfirm = async () => {
        if (!toDelete) return;
        try {
            setDeleting(true);
            setDeleteError(null);
            await adminService.deleteStudent(toDelete._id);
            setStudents((prev) => prev.filter((s) => s._id !== toDelete._id));
            setToDelete(null);
        } catch (err) {
            setDeleteError(err.response?.data?.message || "Delete failed. Please try again.");
        } finally {
            setDeleting(false);
        }
    };

    // ── Helpers ────────────────────────────────────────────────────────────
    const formatDate = (iso) =>
        iso
            ? new Date(iso).toLocaleDateString("en-IN", {
                  day: "numeric", month: "short", year: "numeric",
              })
            : "—";

    // ── Render ─────────────────────────────────────────────────────────────
    return (
        <>
            <div className="space-y-4">
                {/* Search bar */}
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="relative max-w-sm w-full">
                        <Search
                            size={16}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary"
                        />
                        <input
                            id="student-search"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search by name or email…"
                            className="w-full h-11 rounded-input border border-border-light pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                        />
                    </div>
                    {!loading && (
                        <span className="text-caption text-text-secondary shrink-0">
                            {students.length} student{students.length !== 1 ? "s" : ""}
                        </span>
                    )}
                </div>

                {/* Delete error banner */}
                {deleteError && (
                    <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                        <AlertTriangle size={15} />
                        {deleteError}
                        <button
                            onClick={() => setDeleteError(null)}
                            className="ml-auto text-red-400 hover:text-red-600"
                        >
                            <X size={14} />
                        </button>
                    </div>
                )}

                {/* Error state */}
                {error && !loading && (
                    <Card className="py-12 text-center space-y-3">
                        <p className="text-body text-red-500 font-semibold">⚠ {error}</p>
                        <button
                            onClick={() => fetchStudents(search)}
                            className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:opacity-90 transition-opacity"
                        >
                            Retry
                        </button>
                    </Card>
                )}

                {/* Table */}
                {!error && (
                    <Card className="overflow-x-auto">
                        <table className="w-full text-left text-sm min-w-[640px]">
                            <thead>
                                <tr className="text-caption text-text-secondary border-b border-border-light">
                                    <th className="py-3 pr-4 font-medium">Name</th>
                                    <th className="py-3 pr-4 font-medium">Email</th>
                                    <th className="py-3 pr-4 font-medium">Courses Enrolled</th>
                                    <th className="py-3 pr-4 font-medium">Joined</th>
                                    <th className="py-3 pr-4 font-medium">Status</th>
                                    <th className="py-3 pr-4" />
                                </tr>
                            </thead>
                            <tbody>
                                {/* Loading skeletons */}
                                {loading &&
                                    [...Array(6)].map((_, i) => <SkeletonRow key={i} />)}

                                {/* Empty state */}
                                {!loading && students.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="py-16 text-center text-body text-text-secondary"
                                        >
                                            {search
                                                ? `No students found matching "${search}"`
                                                : "No students registered yet."}
                                        </td>
                                    </tr>
                                )}

                                {/* Data rows */}
                                {!loading &&
                                    students.map((s) => (
                                        <tr
                                            key={s._id}
                                            className="border-b border-border-light last:border-0 hover:bg-surface-secondary/40 transition-colors"
                                        >
                                            <td className="py-3 pr-4 text-text-primary font-medium">
                                                {s.name}
                                            </td>
                                            <td className="py-3 pr-4 text-text-secondary">
                                                {s.email}
                                            </td>
                                            <td className="py-3 pr-4 text-text-secondary">
                                                {s.coursesEnrolled}
                                            </td>
                                            <td className="py-3 pr-4 text-text-secondary">
                                                {formatDate(s.joined)}
                                            </td>
                                            <td className="py-3 pr-4">
                                                <Badge
                                                    tone={s.status === "Active" ? "success" : "warning"}
                                                >
                                                    {s.status}
                                                </Badge>
                                            </td>
                                            <td className="py-3 pr-4">
                                                <ActionMenu
                                                    student={s}
                                                    onDelete={setToDelete}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </Card>
                )}
            </div>

            {/* Delete confirmation modal */}
            {toDelete && (
                <DeleteModal
                    student={toDelete}
                    onConfirm={handleDeleteConfirm}
                    onCancel={() => { setToDelete(null); setDeleteError(null); }}
                    deleting={deleting}
                />
            )}
        </>
    );
}
