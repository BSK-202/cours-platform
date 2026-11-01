
"use client";

import { useEffect, useState } from "react";
import { Loader2, Video, X } from "lucide-react";

import {
  createLesson,
  updateLesson,
  type Course,
  type Lesson,
  type LessonInput,
} from "@/lib/api/courses";

interface LessonModalProps {
  course: Course;
  lesson?: Lesson | null;
  nextOrder: number;
  onSuccess: (lesson: Lesson, mode: "create" | "edit") => void;
  onClose: () => void;
}

export default function LessonModal({
  course,
  lesson = null,
  nextOrder,
  onSuccess,
  onClose,
}: LessonModalProps) {
  const isEditing = Boolean(lesson);

  const [title, setTitle] = useState(lesson?.title ?? "");
  const [description, setDescription] = useState(
    lesson?.description ?? "",
  );
  const [videoUrl, setVideoUrl] = useState(lesson?.videoUrl ?? "");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !loading) {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [loading, onClose]);

  function validateForm(): boolean {
    if (title.trim().length < 3) {
      setError("Le titre doit contenir au moins 3 caractères.");
      return false;
    }

    if (title.trim().length > 150) {
      setError("Le titre ne doit pas dépasser 150 caractères.");
      return false;
    }

    if (description.trim().length < 10) {
      setError("La description doit contenir au moins 10 caractères.");
      return false;
    }

    if (description.trim().length > 5000) {
      setError("La description ne doit pas dépasser 5000 caractères.");
      return false;
    }

    if (videoUrl.trim().length > 2048) {
      setError("L'URL de la vidéo est trop longue.");
      return false;
    }

    try {
      const parsedUrl = new URL(videoUrl.trim());

      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        throw new Error("URL invalide");
      }
    } catch {
      setError("Veuillez saisir une URL vidéo valide (HTTP ou HTTPS).");
      return false;
    }

    return true;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (loading || !validateForm()) return;

    const input: LessonInput = {
      title: title.trim(),
      description: description.trim(),
      videoUrl: videoUrl.trim(),
      order: lesson?.order ?? nextOrder,
    };

    setLoading(true);

    try {
      const savedLesson =
        isEditing && lesson
          ? await updateLesson(lesson.id, input)
          : await createLesson(course.id, input);

      onSuccess(savedLesson, isEditing ? "edit" : "create");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible d'enregistrer cette leçon.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="lesson-modal-title"
        className="my-auto w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Video size={23} />
            </div>

            <div>
              <h2
                id="lesson-modal-title"
                className="font-bold text-slate-900"
              >
                {isEditing ? "Modifier la leçon" : "Ajouter une leçon"}
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Formation : {course.title}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Fermer"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-40"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-5 p-5">
            <div>
              <label
                htmlFor="lesson-title"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Titre de la leçon
              </label>

              <input
                id="lesson-title"
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Ex : Introduction au développement web"
                maxLength={150}
                required
                disabled={loading}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
              />
            </div>

            <div>
              <label
                htmlFor="lesson-description"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Description
              </label>

              <textarea
                id="lesson-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Décrivez le contenu de cette leçon..."
                rows={4}
                maxLength={5000}
                required
                disabled={loading}
                className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
              />

              <p className="mt-1 text-right text-xs text-slate-400">
                {description.length}/5000
              </p>
            </div>

            <div>
              <label
                htmlFor="lesson-video"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                URL de la vidéo
              </label>

              <input
                id="lesson-video"
                type="url"
                value={videoUrl}
                onChange={(event) => setVideoUrl(event.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                required
                disabled={loading}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
              />

              <p className="mt-2 text-xs leading-relaxed text-slate-500">
                Ajoutez un lien vidéo accessible en ligne. L'hébergement des
                fichiers vidéo n'est pas inclus dans cette version.
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50 p-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
            >
              Annuler
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading && (
                <Loader2 size={16} className="animate-spin" />
              )}

              {loading
                ? "Enregistrement..."
                : isEditing
                  ? "Enregistrer les modifications"
                  : "Ajouter la leçon"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
