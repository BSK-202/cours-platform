
"use client";

import { useState, type FormEvent } from "react";
import { Loader2, X } from "lucide-react";
import {
  updateCourse,
  type Course,
} from "@/lib/api/courses";

interface CourseEditFormProps {
  course: Course;
  onSuccess: (course: Course) => void;
  onCancel: () => void;
}

export default function CourseEditForm({
  course,
  onSuccess,
  onCancel,
}: CourseEditFormProps) {
  const [title, setTitle] = useState(course.title);
  const [description, setDescription] = useState(course.description);
  const [coverImageUrl, setCoverImageUrl] = useState(
    course.coverImageUrl ?? "",
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      const updatedCourse = await updateCourse(course.id, {
        title: title.trim(),
        description: description.trim(),
        coverImageUrl: coverImageUrl.trim(),
      });

      onSuccess(updatedCourse);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de modifier la formation.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Modifier la formation
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Modifiez les informations de votre formation.
          </p>
        </div>

        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          aria-label="Fermer"
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="edit-course-title"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Titre de la formation *
          </label>
          <input
            id="edit-course-title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            minLength={3}
            maxLength={150}
            required
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <div>
          <label
            htmlFor="edit-course-description"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Description *
          </label>
          <textarea
            id="edit-course-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            minLength={10}
            maxLength={5000}
            required
            rows={5}
            className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <div>
          <label
            htmlFor="edit-course-cover"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            URL de l'image de couverture (facultatif)
          </label>
          <input
            id="edit-course-cover"
            type="url"
            value={coverImageUrl}
            onChange={(event) => setCoverImageUrl(event.target.value)}
            placeholder="https://example.com/image.jpg"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
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

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Annuler
          </button>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading && <Loader2 size={17} className="animate-spin" />}
            {loading ? "Enregistrement..." : "Enregistrer les modifications"}
          </button>
        </div>
      </form>
    </div>
  );
}
