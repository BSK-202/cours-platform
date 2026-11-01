
import type { Metadata } from "next";
import StudentDashboard from "@/components/student/StudentDashboard";
import { requireUser } from "@/lib/auth/require-user";

export const instant = false;

export const metadata: Metadata = {
  title: "Espace étudiant | Ikrame BASKANE",
  description: "Accédez à votre espace d'apprentissage.",
};

export default async function StudentPage() {
  await requireUser("STUDENT");

  return <StudentDashboard />;
}
