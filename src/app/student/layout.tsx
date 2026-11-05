import { requireUser } from "@/lib/auth/require-user";
import StudentShell from "@/components/student/StudentShell";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireUser("STUDENT");
  return <StudentShell>{children}</StudentShell>;
}