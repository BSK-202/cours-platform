import { requireUser } from "@/lib/auth/require-user";
import StudentCourseDetailPage from "./StudentCourseDetailPage";

export const instant = false;

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireUser("STUDENT");
  return <StudentCourseDetailPage courseId={id} />;
}