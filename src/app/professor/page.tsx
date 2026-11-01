
import ProfessorDashboard from "@/components/professor/ProfessorDashboard";
import { requireUser } from "@/lib/auth/require-user";

export const instant = false;

export default async function ProfessorPage() {
  await requireUser("PROFESSOR");

  return <ProfessorDashboard />;
}
