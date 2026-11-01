
"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Loader2, X, BookOpen } from "lucide-react";
import {
  createCourse,
  updateCourse,
  type Course,
} from "@/lib/api/courses";

interface CourseModalProps {
  course?: Course | null;
  onSuccess: (course: Course, mode: "create" | "edit") => void;
  onClose: () => void;
}

export default function CourseModal({
  course = null,
  onSuccess,
  onClose,
}: CourseModalProps) {
  const isEditing = Boolean(course);

  const [title, setTitle] = useState(course?.title ?? "");
  const [description, setDescription] = useState(
    course?.description ?? "",
  );
  const [coverImageUrl, setCoverImageUrl] = useState(
    course?.coverImageUrl ?? "",
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && !loading) {
        onClose();
      }
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [loading, onClose]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (title.trim().length < 3) {
      setError("Le titre doit contenir au moins 3 caractères.");
      return;
    }

    if (description.trim().length < 10) {
      setError("La description doit contenir au moins 10 caractères.");
      return;
    }

    if (coverImageUrl.trim()) {
      try {
        const url = new URL(coverImageUrl.trim());

        if (!["http:", "https:"].includes(url.protocol)) {
          throw new Error();
        }
      } catch {
        setError("Veuillez saisir une URL d'image valide.");
        return;
      }
    }

    setLoading(true);

    try {
      const input = {
        title: title.trim(),
        description: description.trim(),
        coverImageUrl: coverImageUrl.trim(),
      };

      const savedCourse = isEditing && course
        ? await updateCourse(course.id, input)
        : await createCourse(input);

      onSuccess(savedCourse, isEditing ? "edit" : "create");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Une erreur est survenue. Veuillez réessayer.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="course-modal-title"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-100 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <BookOpen size={22} />
            </div>

            <div>
              <h2
                id="course-modal-title"
                className="text-lg font-bold text-slate-900"
              >
                {isEditing ? "Modifier la formation" : "Nouvelle formation"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {isEditing
                  ? "Mettez à jour les informations de votre formation."
                  : "Renseignez les informations de votre formation."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Fermer la fenêtre"
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-5 p-6">
            <div>
              <label
                htmlFor="modal-course-title"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Titre de la formation *
              </label>

              <input
                id="modal-course-title"
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                minLength={3}
                maxLength={150}
                required
                placeholder="Ex. : Introduction à Java"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label
                htmlFor="modal-course-description"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Description *
              </label>

              <textarea
                id="modal-course-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                minLength={10}
                maxLength={5000}
                required
                rows={5}
                placeholder="Présentez les objectifs et le contenu de cette formation..."
                className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label
                htmlFor="modal-course-cover"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                URL de l'image de couverture
                <span className="ml-1 font-normal text-slate-400">
                  (facultatif)
                </span>
              </label>

              <input
                id="modal-course-cover"
                type="url"
                value={coverImageUrl}
                onChange={(event) => setCoverImageUrl(event.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              >
                {error}
              </p>
            )}
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50 p-6 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
            >
              Annuler
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading && (
                <Loader2 size={17} className="animate-spin" />
              )}

              {loading
                ? "Enregistrement..."
                : isEditing
                  ? "Enregistrer les modifications"
                  : "Créer la formation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
