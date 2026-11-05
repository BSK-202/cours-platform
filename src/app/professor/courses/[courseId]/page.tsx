import { requireUser } from "@/lib/auth/require-user";
import ProfessorCourseDetailPage from "./ProfessorCourseDetailPage";

export const instant = false;

export default async function Page() {
  await requireUser("PROFESSOR");
  return <ProfessorCourseDetailPage />;
}