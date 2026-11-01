
"use client";

import { useEffect } from "react";
import {
  AlertTriangle,
  Loader2,
  X,
} from "lucide-react";

interface ConfirmDialogProps {
  title?: string;
  message: string;
  itemName?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  title = "Confirmer la suppression",
  message,
  itemName,
  confirmLabel = "Supprimer",
  cancelLabel = "Annuler",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !loading) {
        onCancel();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [loading, onCancel]);

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) {
          onCancel();
        }
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
        className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 duration-200"
      >
        <div className="flex items-start justify-between border-b border-slate-100 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <AlertTriangle size={23} />
            </div>

            <div>
              <h2
                id="confirm-dialog-title"
                className="font-bold text-slate-900"
              >
                {title}
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Cette action nécessite votre confirmation.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            aria-label="Fermer"
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-40"
          >
            <X size={19} />
          </button>
        </div>

        <div className="p-5">
          <p
            id="confirm-dialog-description"
            className="text-sm leading-relaxed text-slate-600"
          >
            {message}
          </p>

          {itemName && (
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-medium text-slate-500">
                Formation concernée
              </p>

              <p className="mt-1 break-words text-sm font-semibold text-slate-900">
                {itemName}
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50 p-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading && (
              <Loader2 size={16} className="animate-spin" />
            )}

            {loading ? "Suppression..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
