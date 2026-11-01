
import type { Metadata } from "next";

import AuthLayout from "@/components/auth/AuthLayout";
import RegisterForm from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Créer un compte",
  description:
    "Rejoignez SkillBridge et commencez votre parcours d'apprentissage.",
};

export default function RegisterPage() {
  return (
    <AuthLayout
      mode="register"
      title="Créer votre compte"
      subtitle="Inscrivez-vous gratuitement et découvrez un nouvel environnement d'apprentissage."
    >
      <RegisterForm />
    </AuthLayout>
  );
}
