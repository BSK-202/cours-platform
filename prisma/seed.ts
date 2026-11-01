import "dotenv/config";

import { prisma } from "../src/lib/prisma";
import { hashPassword } from "../src/lib/auth/password";

async function main() {
  const professors = [
    {
      email: process.env.SEED_PROFESSOR_EMAIL,
      name: process.env.SEED_PROFESSOR_NAME,
      password: process.env.SEED_PROFESSOR_PASSWORD,
    },
    {
      email: process.env.SEED_PROFESSOR_2_EMAIL,
      name: process.env.SEED_PROFESSOR_2_NAME,
      password: process.env.SEED_PROFESSOR_2_PASSWORD,
    },
  ];

  for (const professorData of professors) {
    const { email, name, password } = professorData;

    if (!email || !name || !password) {
      throw new Error(
        "Toutes les variables des deux comptes professeurs sont obligatoires."
      );
    }

    const passwordHash = await hashPassword(password);

    const professor = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        name,
        email,
        passwordHash,
        role: "PROFESSOR",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    console.log("Compte professeur prêt :", professor);
  }
}

main()
  .catch((error) => {
    console.error("Erreur Seed :", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });