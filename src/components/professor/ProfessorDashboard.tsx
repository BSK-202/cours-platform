
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    BookOpen,
    GraduationCap,
    Video,
    Plus,
    LogOut,
    LayoutDashboard,
    Loader2,
    Eye,
    EyeOff,
    Trash2,
    ChevronDown,
    ChevronUp,
    Pencil,
    RefreshCw,
} from "lucide-react";

import {
    getCurrentUser,
    logoutUser,
    type AuthUser,
} from "@/lib/api/auth";

import {
    getCourses,
    getLessons,
    updateCourse,
    deleteCourse,
    deleteLesson,
    type Course,
    type Lesson,
} from "@/lib/api/courses";

import CourseModal from "@/components/professor/CourseModal";
import LessonModal from "@/components/professor/LessonModal";
import Toast, { type ToastType } from "@/components/ui/Toast";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

interface ToastState {
    type: ToastType;
    message: string;
}

export default function ProfessorDashboard() {
    const router = useRouter();

    const [user, setUser] = useState<AuthUser | null>(null);
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [loggingOut, setLoggingOut] = useState(false);

    const [toast, setToast] = useState<ToastState | null>(null);

    const [courseModalOpen, setCourseModalOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);

    const [lessonCourse, setLessonCourse] = useState<Course | null>(null);
    const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);

    const [lessonsByCourse, setLessonsByCourse] = useState<
        Record<string, Lesson[]>
    >({});

    const [expandedCourseId, setExpandedCourseId] = useState<string | null>(
        null,
    );

    const [loadingLessonsFor, setLoadingLessonsFor] = useState<string | null>(
        null,
    );

    const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
    const [lessonToDelete, setLessonToDelete] = useState<Lesson | null>(null);
    const [lessonDeleteCourseId, setLessonDeleteCourseId] = useState<
        string | null
    >(null);

    const [processingCourseId, setProcessingCourseId] = useState<string | null>(
        null,
    );

    const [processingLessonId, setProcessingLessonId] = useState<string | null>(
        null,
    );

    function showToast(type: ToastType, message: string) {
        setToast({ type, message });
    }

    function closeToast() {
        setToast(null);
    }

    async function loadDashboard() {
        setLoading(true);

        try {
            const currentUser = await getCurrentUser();

            if (currentUser.role !== "PROFESSOR") {
                router.replace("/student");
                return;
            }

            setUser(currentUser);

            const professorCourses = await getCourses();
            setCourses(professorCourses);
        } catch (err) {
            showToast(
                "error",
                err instanceof Error
                    ? err.message
                    : "Impossible de charger le tableau de bord.",
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadDashboard();
    }, []);

    // FORMATIONS

    function openCreateModal() {
        setEditingCourse(null);
        setCourseModalOpen(true);
        closeToast();
    }

    function openEditModal(course: Course) {
        setEditingCourse(course);
        setCourseModalOpen(true);
        closeToast();
    }

    function closeCourseModal() {
        setCourseModalOpen(false);
        setEditingCourse(null);
    }

    function handleCourseSaved(
        savedCourse: Course,
        mode: "create" | "edit",
    ) {
        if (mode === "create") {
            setCourses((current) => [savedCourse, ...current]);
            showToast("success", "Votre formation a été créée avec succès.");
        } else {
            setCourses((current) =>
                current.map((course) =>
                    course.id === savedCourse.id
                        ? { ...course, ...savedCourse }
                        : course,
                ),
            );

            showToast("success", "Votre formation a été modifiée avec succès.");
        }

        closeCourseModal();
    }

    async function handleTogglePublication(course: Course) {
        if (processingCourseId || processingLessonId) return;

        const nextStatus =
            course.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";

        if (nextStatus === "PUBLISHED" && course._count.lessons === 0) {
            showToast(
                "error",
                "Ajoutez au moins une leçon avant de publier cette formation.",
            );
            return;
        }

        setProcessingCourseId(course.id);
        closeToast();

        try {
            const updatedCourse = await updateCourse(course.id, {
                status: nextStatus,
            });

            setCourses((current) =>
                current.map((item) =>
                    item.id === updatedCourse.id
                        ? { ...item, ...updatedCourse }
                        : item,
                ),
            );

            showToast(
                "success",
                nextStatus === "PUBLISHED"
                    ? "Votre formation a été publiée avec succès."
                    : "Votre formation a été dépubliée avec succès.",
            );
        } catch (err) {
            showToast(
                "error",
                err instanceof Error
                    ? err.message
                    : "Impossible de modifier le statut de la formation.",
            );
        } finally {
            setProcessingCourseId(null);
        }
    }

    function openDeleteDialog(course: Course) {
        setCourseToDelete(course);
        closeToast();
    }

    function closeDeleteDialog() {
        if (processingCourseId) return;
        setCourseToDelete(null);
    }

    async function handleDeleteCourse() {
        if (!courseToDelete || processingCourseId) return;

        const course = courseToDelete;

        setProcessingCourseId(course.id);
        closeToast();

        try {
            await deleteCourse(course.id);

            setCourses((current) =>
                current.filter((item) => item.id !== course.id),
            );

            setLessonsByCourse((current) => {
                const updated = { ...current };
                delete updated[course.id];
                return updated;
            });

            if (expandedCourseId === course.id) {
                setExpandedCourseId(null);
            }

            setCourseToDelete(null);
            showToast("success", "Votre formation a été supprimée avec succès.");
        } catch (err) {
            setCourseToDelete(null);

            showToast(
                "error",
                err instanceof Error
                    ? err.message
                    : "Impossible de supprimer cette formation.",
            );
        } finally {
            setProcessingCourseId(null);
        }
    }

    // LEÇONS

    async function toggleLessons(course: Course) {
        if (loadingLessonsFor || processingCourseId || processingLessonId) return;

        if (expandedCourseId === course.id) {
            setExpandedCourseId(null);
            return;
        }

        setExpandedCourseId(course.id);

        if (lessonsByCourse[course.id]) return;

        setLoadingLessonsFor(course.id);

        try {
            const lessons = await getLessons(course.id);

            setLessonsByCourse((current) => ({
                ...current,
                [course.id]: [...lessons].sort((a, b) => a.order - b.order),
            }));
        } catch (err) {
            setExpandedCourseId(null);

            showToast(
                "error",
                err instanceof Error
                    ? err.message
                    : "Impossible de charger les leçons.",
            );
        } finally {
            setLoadingLessonsFor(null);
        }
    }

    function openCreateLesson(course: Course) {
        setLessonCourse(course);
        setEditingLesson(null);
        closeToast();
    }

    function openEditLesson(course: Course, lesson: Lesson) {
        setLessonCourse(course);
        setEditingLesson(lesson);
        closeToast();
    }

    function closeLessonModal() {
        setLessonCourse(null);
        setEditingLesson(null);
    }

    function handleLessonSaved(
        savedLesson: Lesson,
        mode: "create" | "edit",
    ) {
        if (!lessonCourse) return;

        const courseId = lessonCourse.id;

        setLessonsByCourse((current) => {
            const existing = current[courseId] ?? [];

            const updated =
                mode === "create"
                    ? [...existing, savedLesson]
                    : existing.map((lesson) =>
                        lesson.id === savedLesson.id ? savedLesson : lesson,
                    );

            return {
                ...current,
                [courseId]: updated.sort((a, b) => a.order - b.order),
            };
        });

        if (mode === "create") {
            setCourses((current) =>
                current.map((course) =>
                    course.id === courseId
                        ? {
                            ...course,
                            _count: {
                                ...course._count,
                                lessons: course._count.lessons + 1,
                            },
                        }
                        : course,
                ),
            );

            showToast("success", "La leçon a été ajoutée avec succès.");
        } else {
            showToast("success", "La leçon a été modifiée avec succès.");
        }

        closeLessonModal();
    }

    function openDeleteLessonDialog(courseId: string, lesson: Lesson) {
        setLessonDeleteCourseId(courseId);
        setLessonToDelete(lesson);
        closeToast();
    }

    function closeDeleteLessonDialog() {
        if (processingLessonId) return;

        setLessonToDelete(null);
        setLessonDeleteCourseId(null);
    }

    async function handleDeleteLesson() {
        if (!lessonToDelete || !lessonDeleteCourseId || processingLessonId) {
            return;
        }

        const lesson = lessonToDelete;
        const courseId = lessonDeleteCourseId;

        setProcessingLessonId(lesson.id);
        closeToast();

        try {
            await deleteLesson(lesson.id);

            setLessonsByCourse((current) => ({
                ...current,
                [courseId]: (current[courseId] ?? []).filter(
                    (item) => item.id !== lesson.id,
                ),
            }));

            setCourses((current) =>
                current.map((course) =>
                    course.id === courseId
                        ? {
                            ...course,
                            _count: {
                                ...course._count,
                                lessons: Math.max(0, course._count.lessons - 1),
                            },
                        }
                        : course,
                ),
            );

            setLessonToDelete(null);
            setLessonDeleteCourseId(null);

            showToast("success", "La leçon a été supprimée avec succès.");
        } catch (err) {
            setLessonToDelete(null);
            setLessonDeleteCourseId(null);

            showToast(
                "error",
                err instanceof Error
                    ? err.message
                    : "Impossible de supprimer cette leçon.",
            );
        } finally {
            setProcessingLessonId(null);
        }
    }

    // AUTHENTIFICATION

    async function handleLogout() {
        if (loggingOut) return;

        setLoggingOut(true);
        closeToast();

        try {
            await logoutUser();
            router.replace("/login");
        } catch {
            showToast(
                "error",
                "Impossible de vous déconnecter. Réessayez.",
            );
            setLoggingOut(false);
        }
    }

    // STATISTIQUES

    const publishedCourses = courses.filter(
        (course) => course.status === "PUBLISHED",
    );

    const draftCourses = courses.filter(
        (course) => course.status === "DRAFT",
    );

    const totalLessons = courses.reduce(
        (total, course) => total + (course._count?.lessons ?? 0),
        0,
    );

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <div className="text-center">
                    <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-indigo-600" />
                    <p className="text-sm text-slate-500">
                        Chargement de votre espace professeur...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {toast && (
                <Toast
                    type={toast.type}
                    message={toast.message}
                    onClose={closeToast}
                />
            )}

            <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
                            <GraduationCap size={23} />
                        </div>

                        <div>
                            <p className="font-bold text-slate-900">Ikrame BASKANE</p>
                            <p className="text-xs text-slate-500">Espace professeur</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden text-right sm:block">
                            <p className="text-sm font-semibold text-slate-800">
                                {user?.name}
                            </p>
                            <p className="text-xs text-slate-500">Professeur</p>
                        </div>

                        <button
                            onClick={handleLogout}
                            disabled={loggingOut}
                            className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                        >
                            {loggingOut ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <LogOut size={16} />
                            )}
                            <span className="hidden sm:inline">Déconnexion</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <p className="mb-1 text-sm font-medium text-indigo-600">
                            Tableau de bord
                        </p>

                        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                            Bonjour, {user?.name?.split(" ")[0]} 👋
                        </h1>

                        <p className="mt-2 text-sm text-slate-500">
                            Gérez vos formations, vos leçons et vos sessions Live.
                        </p>
                    </div>

                    <button
                        onClick={openCreateModal}
                        className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                    >
                        <Plus size={18} />
                        Nouvelle formation
                    </button>
                </div>

                <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                        {
                            label: "Total formations",
                            value: courses.length,
                            icon: BookOpen,
                            color: "bg-indigo-50 text-indigo-600",
                        },
                        {
                            label: "Publiées",
                            value: publishedCourses.length,
                            icon: GraduationCap,
                            color: "bg-emerald-50 text-emerald-600",
                        },
                        {
                            label: "Brouillons",
                            value: draftCourses.length,
                            icon: LayoutDashboard,
                            color: "bg-amber-50 text-amber-600",
                        },
                        {
                            label: "Total leçons",
                            value: totalLessons,
                            icon: Video,
                            color: "bg-sky-50 text-sky-600",
                        },
                    ].map((stat) => {
                        const Icon = stat.icon;

                        return (
                            <div
                                key={stat.label}
                                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-500">{stat.label}</p>
                                        <p className="mt-2 text-3xl font-bold text-slate-900">
                                            {stat.value}
                                        </p>
                                    </div>

                                    <div
                                        className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.color}`}
                                    >
                                        <Icon size={23} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center">
                        <div>
                            <h2 className="font-bold text-slate-900">Mes formations</h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Consultez et gérez vos formations et leurs leçons.
                            </p>
                        </div>

                        <span className="text-sm text-slate-500">
                            {courses.length} formation(s)
                        </span>
                    </div>

                    {courses.length === 0 ? (
                        <div className="px-5 py-16 text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                                <BookOpen size={30} />
                            </div>

                            <h3 className="font-semibold text-slate-900">
                                Aucune formation pour le moment
                            </h3>

                            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                                Créez votre première formation pour commencer à partager vos
                                connaissances avec vos étudiants.
                            </p>

                            <button
                                onClick={openCreateModal}
                                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
                            >
                                <Plus size={18} />
                                Créer une formation
                            </button>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {courses.map((course) => {
                                const isProcessing = processingCourseId === course.id;
                                const isExpanded = expandedCourseId === course.id;
                                const courseLessons = lessonsByCourse[course.id] ?? [];

                                return (
                                    <div key={course.id}>
                                        <div className="flex flex-col justify-between gap-4 p-5 lg:flex-row lg:items-center">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h3 className="font-semibold text-slate-900">
                                                        {course.title}
                                                    </h3>

                                                    <span
                                                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${course.status === "PUBLISHED"
                                                                ? "bg-emerald-50 text-emerald-700"
                                                                : "bg-amber-50 text-amber-700"
                                                            }`}
                                                    >
                                                        {course.status === "PUBLISHED"
                                                            ? "Publiée"
                                                            : "Brouillon"}
                                                    </span>
                                                </div>

                                                <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                                                    {course.description}
                                                </p>

                                                <p className="mt-2 text-xs text-slate-400">
                                                    {course._count?.lessons ?? 0} leçon(s)
                                                </p>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-2">
                                                <button
                                                    onClick={() => toggleLessons(course)}
                                                    disabled={
                                                        loadingLessonsFor === course.id ||
                                                        Boolean(processingCourseId) ||
                                                        Boolean(processingLessonId)
                                                    }
                                                    className="flex items-center gap-2 rounded-lg border border-indigo-200 px-3 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50 disabled:opacity-50"
                                                >
                                                    {loadingLessonsFor === course.id ? (
                                                        <Loader2 size={15} className="animate-spin" />
                                                    ) : isExpanded ? (
                                                        <ChevronUp size={15} />
                                                    ) : (
                                                        <ChevronDown size={15} />
                                                    )}
                                                    {isExpanded ? "Masquer les leçons" : "Gérer les leçons"}
                                                </button>

                                                <button
                                                    onClick={() => openEditModal(course)}
                                                    disabled={isProcessing}
                                                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 disabled:opacity-50"
                                                >
                                                    Modifier
                                                </button>

                                                <button
                                                    onClick={() => handleTogglePublication(course)}
                                                    disabled={isProcessing || Boolean(processingLessonId)}
                                                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition disabled:opacity-50 ${course.status === "PUBLISHED"
                                                            ? "border border-amber-200 text-amber-700 hover:bg-amber-50"
                                                            : "bg-emerald-600 text-white hover:bg-emerald-700"
                                                        }`}
                                                >
                                                    {isProcessing ? (
                                                        <Loader2 size={15} className="animate-spin" />
                                                    ) : course.status === "PUBLISHED" ? (
                                                        <EyeOff size={15} />
                                                    ) : (
                                                        <Eye size={15} />
                                                    )}

                                                    {course.status === "PUBLISHED"
                                                        ? "Dépublier"
                                                        : "Publier"}
                                                </button>

                                                <button
                                                    onClick={() => openDeleteDialog(course)}
                                                    disabled={isProcessing || Boolean(processingLessonId)}
                                                    title="Supprimer la formation"
                                                    className="flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                                                >
                                                    <Trash2 size={15} />
                                                    <span className="lg:hidden">Supprimer</span>
                                                </button>
                                            </div>
                                        </div>

                                        {isExpanded && (
                                            <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-5">
                                                <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                                                    <div>
                                                        <h4 className="font-semibold text-slate-800">
                                                            Contenu de la formation
                                                        </h4>
                                                        <p className="mt-1 text-xs text-slate-500">
                                                            Organisez les leçons de cette formation.
                                                        </p>
                                                    </div>

                                                    <button
                                                        onClick={() => openCreateLesson(course)}
                                                        disabled={Boolean(processingLessonId)}
                                                        className="flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
                                                    >
                                                        <Plus size={16} />
                                                        Ajouter une leçon
                                                    </button>
                                                </div>

                                                {loadingLessonsFor === course.id ? (
                                                    <div className="flex items-center justify-center gap-2 py-8 text-sm text-slate-500">
                                                        <Loader2
                                                            size={18}
                                                            className="animate-spin text-indigo-600"
                                                        />
                                                        Chargement des leçons...
                                                    </div>
                                                ) : courseLessons.length === 0 ? (
                                                    <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center">
                                                        <Video
                                                            size={28}
                                                            className="mx-auto mb-3 text-slate-400"
                                                        />
                                                        <p className="text-sm font-medium text-slate-700">
                                                            Aucune leçon dans cette formation
                                                        </p>
                                                        <p className="mt-1 text-xs text-slate-500">
                                                            Ajoutez votre première leçon pour enrichir votre
                                                            formation.
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-3">
                                                        {courseLessons.map((lesson, index) => (
                                                            <div
                                                                key={lesson.id}
                                                                className="flex flex-col justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center"
                                                            >
                                                                <div className="flex min-w-0 items-start gap-3">
                                                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-sm font-bold text-indigo-600">
                                                                        {index + 1}
                                                                    </div>

                                                                    <div className="min-w-0">
                                                                        <h5 className="font-semibold text-slate-800">
                                                                            {lesson.title}
                                                                        </h5>

                                                                        <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                                                                            {lesson.description}
                                                                        </p>

                                                                        <a
                                                                            href={lesson.videoUrl}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800"
                                                                        >
                                                                            <Video size={13} />
                                                                            Ouvrir la vidéo
                                                                        </a>
                                                                    </div>
                                                                </div>

                                                                <div className="flex shrink-0 items-center gap-2">
                                                                    <button
                                                                        onClick={() =>
                                                                            openEditLesson(course, lesson)
                                                                        }
                                                                        disabled={Boolean(processingLessonId)}
                                                                        className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 disabled:opacity-50"
                                                                        title="Modifier la leçon"
                                                                    >
                                                                        <Pencil size={16} />
                                                                    </button>

                                                                    <button
                                                                        onClick={() =>
                                                                            openDeleteLessonDialog(course.id, lesson)
                                                                        }
                                                                        disabled={Boolean(processingLessonId)}
                                                                        className="rounded-lg border border-red-200 p-2 text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                                                                        title="Supprimer la leçon"
                                                                    >
                                                                        <Trash2 size={16} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>
            </main>

            {courseModalOpen && (
                <CourseModal
                    key={editingCourse?.id ?? "new-course"}
                    course={editingCourse}
                    onSuccess={handleCourseSaved}
                    onClose={closeCourseModal}
                />
            )}

            {lessonCourse && (
                <LessonModal
                    key={editingLesson?.id ?? `new-lesson-${lessonCourse.id}`}
                    course={lessonCourse}
                    lesson={editingLesson}
                    nextOrder={
                        Math.max(
                            0,
                            ...(lessonsByCourse[lessonCourse.id] ?? []).map(
                                (lesson) => lesson.order,
                            ),
                        ) + 1
                    }
                    onSuccess={handleLessonSaved}
                    onClose={closeLessonModal}
                />
            )}

            {courseToDelete && (
                <ConfirmDialog
                    title="Confirmer la suppression"
                    message="Cette action est définitive. La formation ainsi que ses leçons et ses sessions Live associées seront supprimées."
                    itemName={courseToDelete.title}
                    confirmLabel="Supprimer définitivement"
                    cancelLabel="Annuler"
                    loading={processingCourseId === courseToDelete.id}
                    onConfirm={handleDeleteCourse}
                    onCancel={closeDeleteDialog}
                />
            )}

            {lessonToDelete && (
                <ConfirmDialog
                    title="Supprimer cette leçon ?"
                    message="Cette action est définitive. La leçon sera supprimée de cette formation."
                    itemName={lessonToDelete.title}
                    confirmLabel="Supprimer la leçon"
                    cancelLabel="Annuler"
                    loading={processingLessonId === lessonToDelete.id}
                    onConfirm={handleDeleteLesson}
                    onCancel={closeDeleteLessonDialog}
                />
            )}
        </div>
    );
}
