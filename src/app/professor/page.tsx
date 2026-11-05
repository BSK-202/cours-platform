import { requireUser } from "@/lib/auth/require-user";
import ProfessorDashboard from "@/components/professor/ProfessorDashboard";
// On autorise cette page à "bloquer" le temps de vérifier la session.
// C'est la solution officielle pour les pages qui lisent les cookies.
export const instant = false; 
export default async function ProfessorPage() {
  await requireUser("PROFESSOR");
  return <ProfessorDashboard />;
}