
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  User,
  Mail,
  Lock,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

import { registerUser } from "@/lib/api/auth";

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
}

export default function RegisterForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);

  function validateForm(): boolean {
    const newErrors: FormErrors = {};

    const normalizedName = name.trim();
    const normalizedEmail = email.trim();

    if (normalizedName.length < 2) {
      newErrors.name = "Le nom doit contenir au moins 2 caractères.";
    } else if (normalizedName.length > 100) {
      newErrors.name = "Le nom ne doit pas dépasser 100 caractères.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      newErrors.email = "Veuillez saisir une adresse email valide.";
    } else if (normalizedEmail.length > 254) {
      newErrors.email = "Adresse email trop longue.";
    }

    if (password.length < 8) {
      newErrors.password =
        "Le mot de passe doit contenir au moins 8 caractères.";
    } else if (password.length > 72) {
      newErrors.password = "Le mot de passe est trop long.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setServerError("");
    setSuccess(false);

    if (!validateForm()) return;

    setLoading(true);

    try {
      await registerUser({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      setSuccess(true);

      // L'inscription ne crée pas de session.
      // L'utilisateur doit ensuite se connecter.
      setTimeout(() => {
        router.push("/login?registered=true");
      }, 1200);
    } catch (error) {
      setServerError(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue. Veuillez réessayer."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {/* Server error */}
      {serverError && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <AlertCircle size={19} className="mt-0.5 shrink-0" />
          <p>{serverError}</p>
        </div>
      )}

      {/* Success */}
      {success && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"
        >
          <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
          <p>
            Votre compte a été créé avec succès ! Redirection vers la connexion...
          </p>
        </div>
      )}

      {/* Name */}
      <div>
        <label
          htmlFor="name"
          className="mb-2 block text-sm font-semibold text-slate-700"
        >
          Nom complet
        </label>

        <div className="relative">
          <User
            size={19}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Votre nom complet"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setErrors((previous) => ({ ...previous, name: undefined }));
            }}
            disabled={loading || success}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "name-error" : undefined}
            className={`w-full rounded-xl border bg-white py-3.5 pl-12 pr-4 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:ring-4 focus:ring-indigo-100 disabled:bg-slate-50 ${
              errors.name
                ? "border-red-400 focus:border-red-500"
                : "border-slate-200 focus:border-indigo-500"
            }`}
          />
        </div>

        {errors.name && (
          <p id="name-error" className="mt-2 text-xs text-red-600">
            {errors.name}
          </p>
        )}
      </div>

      {/* Email */}
      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-sm font-semibold text-slate-700"
        >
          Adresse email
        </label>

        <div className="relative">
          <Mail
            size={19}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="exemple@email.com"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setErrors((previous) => ({ ...previous, email: undefined }));
            }}
            disabled={loading || success}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
            className={`w-full rounded-xl border bg-white py-3.5 pl-12 pr-4 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:ring-4 focus:ring-indigo-100 disabled:bg-slate-50 ${
              errors.email
                ? "border-red-400 focus:border-red-500"
                : "border-slate-200 focus:border-indigo-500"
            }`}
          />
        </div>

        {errors.email && (
          <p id="email-error" className="mt-2 text-xs text-red-600">
            {errors.email}
          </p>
        )}
      </div>

      {/* Password */}
      <div>
        <label
          htmlFor="password"
          className="mb-2 block text-sm font-semibold text-slate-700"
        >
          Mot de passe
        </label>

        <div className="relative">
          <Lock
            size={19}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Au moins 8 caractères"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setErrors((previous) => ({
                ...previous,
                password: undefined,
              }));
            }}
            disabled={loading || success}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={
              errors.password ? "password-error" : undefined
            }
            className={`w-full rounded-xl border bg-white py-3.5 pl-12 pr-12 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:ring-4 focus:ring-indigo-100 disabled:bg-slate-50 ${
              errors.password
                ? "border-red-400 focus:border-red-500"
                : "border-slate-200 focus:border-indigo-500"
            }`}
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={
              showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"
            }
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-700"
          >
            {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
          </button>
        </div>

        {errors.password && (
          <p id="password-error" className="mt-2 text-xs text-red-600">
            {errors.password}
          </p>
        )}

        <p className="mt-2 text-xs text-slate-400">
          Utilisez au minimum 8 caractères.
        </p>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || success}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 size={19} className="animate-spin" />
            Création du compte...
          </>
        ) : success ? (
          <>
            <CheckCircle2 size={19} />
            Compte créé
          </>
        ) : (
          <>
            Créer mon compte
            <ArrowRight size={18} />
          </>
        )}
      </button>

      <p className="text-center text-xs leading-5 text-slate-400">
        En créant votre compte, vous rejoignez la communauté SkillBridge.
      </p>
    </form>
  );
}
