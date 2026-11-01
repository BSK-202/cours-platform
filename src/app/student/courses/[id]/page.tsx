
import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/require-user";
import StudentCourseDetails from "@/components/student/StudentCourseDetails";

export const instant = false;

export const metadata: Metadata = {
  title: "Détail de la formation | Ikrame BASKANE",
  description: "Consultez les leçons, vidéos et sessions Live de votre formation.",
};

interface StudentCoursePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function StudentCoursePage({
  params,
}: StudentCoursePageProps) {
  await requireUser("STUDENT");

  const { id } = await params;

  return <StudentCourseDetails courseId={id} />;
}
