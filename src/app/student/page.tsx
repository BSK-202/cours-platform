
import type { Metadata } from "next";
import StudentDashboard from "@/components/student/StudentDashboard";

export const metadata: Metadata = {
  title: "Espace étudiant",
  description: "Accédez à votre espace d'apprentissage SkillBridge.",
};

export default function StudentPage() {
  return <StudentDashboard />;
}
