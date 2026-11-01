
"use client";

import { useEffect, useState, type FormEvent } from "react";
import { CalendarDays, Loader2, Video, X } from "lucide-react";

import {
  createLiveSession,
  updateLiveSession,
  type Course,
  type LiveSession,
  type LiveSessionInput,
} from "@/lib/api/courses";

interface LiveSessionModalProps {
  course: Course;
  session?: LiveSession | null;
  onSuccess: (
    savedSession: LiveSession,
    mode: "create" | "edit",
  ) => void;
  onClose: () => void;
}

function toLocalDateTime(value?: string): string {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const timezoneOffset = date.getTimezoneOffset() * 60_000;

  return new Date(date.getTime() - timezoneOffset)
    .toISOString()
    .slice(0, 16);
}

export default function LiveSessionModal({
  course,
  session = null,
  onSuccess,
  onClose,
}: LiveSessionModalProps) {
  const isEditing = Boolean(session);

  const [title, setTitle] = useState(session?.title ?? "");
  const [description, setDescription] = useState(
    session?.description ?? "",
  );
  const [startsAt, setStartsAt] = useState(
    toLocalDateTime(session?.startsAt),
  );
  const [meetingUrl, setMeetingUrl] = useState(
    session?.meetingUrl ?? "",
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && !loading) {
        onClose();
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [loading, onClose]);

  function validateForm(): string | null {
    const cleanTitle = title.trim();
    const cleanDescription = description.trim();
    const cleanMeetingUrl = meetingUrl.trim();

    if (cleanTitle.length < 3 || cleanTitle.length > 150) {
      return "Le titre doit contenir entre 3 et 150 caractères.";
    }

    if (cleanDescription.length > 5000) {
      return "La description ne doit pas dépasser 5000 caractères.";
    }

    if (!startsAt || Number.isNaN(new Date(startsAt).getTime())) {
      return "Veuillez sélectionner une date et une heure valides.";
    }

    if (new Date(startsAt).getTime() <= Date.now()) {
      return "La session doit être programmée dans le futur.";
    }

    if (!cleanMeetingUrl || cleanMeetingUrl.length > 2048) {
      return "Veuillez saisir un lien de visioconférence valide.";
    }

    try {
      const url = new URL(cleanMeetingUrl);

      if (!["http:", "https:"].includes(url.protocol)) {
        return "Le lien doit utiliser HTTP ou HTTPS.";
      }
    } catch {
      return "Le lien de visioconférence est invalide.";
    }

    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    const input: LiveSessionInput = {
      title: title.trim(),
      description: description.trim(),
      startsAt: new Date(startsAt).toISOString(),
      meetingUrl: meetingUrl.trim(),
    };

    setLoading(true);

    try {
      const savedSession = isEditing
        ? await updateLiveSession(session!.id, input)
        : await createLiveSession(course.id, input);

      onSuccess(savedSession, isEditing ? "edit" : "create");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible d'enregistrer la session Live.",
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
        aria-labelledby="live-session-modal-title"
        className="my-auto w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Video size={22} />
            </div>

            <div>
              <h2
                id="live-session-modal-title"
                className="text-lg font-bold text-slate-900"
              >
                {isEditing
                  ? "Modifier la session Live"
                  : "Programmer une session Live"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Formation : {course.title}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Fermer"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-5 px-6 py-6">
            <div>
              <label
                htmlFor="live-title"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Titre de la session *
              </label>

              <input
                id="live-title"
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                maxLength={150}
                required
                placeholder="Ex : Introduction à Java"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label
                htmlFor="live-description"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Description
              </label>

              <textarea
                id="live-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                maxLength={5000}
                rows={3}
                placeholder="Décrivez le contenu de cette session..."
                className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label
                htmlFor="live-starts-at"
                className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700"
              >
                <CalendarDays size={16} />
                Date et heure *
              </label>

              <input
                id="live-starts-at"
                type="datetime-local"
                value={startsAt}
                onChange={(event) => setStartsAt(event.target.value)}
                required
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label
                htmlFor="live-meeting-url"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Lien de visioconférence *
              </label>

              <input
                id="live-meeting-url"
                type="url"
                value={meetingUrl}
                onChange={(event) => setMeetingUrl(event.target.value)}
                maxLength={2048}
                required
                placeholder="https://meet.google.com/..."
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />

              <p className="mt-2 text-xs text-slate-500">
                Ajoutez un lien Google Meet, Zoom ou toute autre
                plateforme de visioconférence.
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

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Annuler
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}

              {loading
                ? "Enregistrement..."
                : isEditing
                  ? "Enregistrer les modifications"
                  : "Programmer la session"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
