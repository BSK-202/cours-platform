import { z } from "zod";

export const createLessonSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Le titre doit contenir au moins 3 caractères.")
    .max(150, "Le titre ne doit pas dépasser 150 caractères."),

  description: z
    .string()
    .trim()
    .min(10, "La description doit contenir au moins 10 caractères.")
    .max(5000, "La description ne doit pas dépasser 5000 caractères."),

  videoUrl: z
    .string()
    .trim()
    .url("L'URL de la vidéo est invalide.")
    .max(2048, "L'URL de la vidéo est trop longue."),

  order: z
    .number()
    .int("L'ordre doit être un nombre entier.")
    .min(1, "L'ordre doit être supérieur ou égal à 1."),
});

export const updateLessonSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3)
      .max(150)
      .optional(),

    description: z
      .string()
      .trim()
      .min(10)
      .max(5000)
      .optional(),

    videoUrl: z
      .string()
      .trim()
      .url()
      .max(2048)
      .optional(),

    order: z
      .number()
      .int()
      .min(1)
      .optional(),
  })
  .strict()
  .refine(
    (data) => Object.keys(data).length > 0,
    "Au moins un champ doit être fourni."
  );

export type CreateLessonInput = z.infer<typeof createLessonSchema>;
export type UpdateLessonInput = z.infer<typeof updateLessonSchema>;