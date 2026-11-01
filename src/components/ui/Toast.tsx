
"use client";

import { useEffect } from "react";
import {
  AlertCircle,
  CheckCircle2,
  X,
} from "lucide-react";

export type ToastType = "success" | "error";

interface ToastProps {
  type: ToastType;
  message: string;
  onClose: () => void;
}

export default function Toast({
  type,
  message,
  onClose,
}: ToastProps) {
  useEffect(() => {
    if (type !== "success") return;

    const timer = window.setTimeout(() => {
      onClose();
    }, 4000);

    return () => window.clearTimeout(timer);
  }, [type, onClose]);

  const isSuccess = type === "success";

  return (
    <div
      role={isSuccess ? "status" : "alert"}
      aria-live={isSuccess ? "polite" : "assertive"}
      className={`fixed right-4 top-5 z-[100] flex w-[calc(100%-2rem)] max-w-md items-start gap-3 rounded-xl border bg-white p-4 shadow-xl animate-in slide-in-from-top-3 fade-in duration-300 ${
        isSuccess
          ? "border-emerald-200"
          : "border-red-200"
      }`}
    >
      <div
        className={`mt-0.5 shrink-0 ${
          isSuccess ? "text-emerald-600" : "text-red-600"
        }`}
      >
        {isSuccess ? (
          <CheckCircle2 size={23} />
        ) : (
          <AlertCircle size={23} />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p
          className={`text-sm font-semibold ${
            isSuccess ? "text-emerald-800" : "text-red-800"
          }`}
        >
          {isSuccess ? "Opération réussie" : "Une erreur est survenue"}
        </p>

        <p className="mt-1 text-sm leading-relaxed text-slate-600">
          {message}
        </p>
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label="Fermer la notification"
        className="shrink-0 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
      >
        <X size={19} />
      </button>
    </div>
  );
}
