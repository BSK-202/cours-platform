
import { Suspense } from "react";
import type { Metadata } from "next";

import AuthLayout from "@/components/auth/AuthLayout";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Connexion",
  description: "Connectez-vous à votre espace SkillBridge.",
};

export default function LoginPage() {
  return (
    <AuthLayout
      mode="login"
      title="Bon retour parmi nous !"
      subtitle="Connectez-vous pour accéder à votre espace d'apprentissage."
    >
      <Suspense
        fallback={
          <div className="py-8 text-center text-sm text-slate-500">
            Chargement du formulaire...
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </AuthLayout>
  );
}
