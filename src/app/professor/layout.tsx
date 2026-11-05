import ProfessorShell from "@/components/professor/ProfessorShell";

export default function ProfessorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProfessorShell>{children}</ProfessorShell>;
}