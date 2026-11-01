
import { z } from "zod";

export const createCourseSchema = z.object({
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

  coverImageUrl: z
    .string()
    .trim()
    .url("L'URL de l'image est invalide.")
    .optional()
    .or(z.literal("")),
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>;


export const updateCourseSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "Le titre doit contenir au moins 3 caractères.")
      .max(150, "Le titre ne doit pas dépasser 150 caractères.")
      .optional(),

    description: z
      .string()
      .trim()
      .min(10, "La description doit contenir au moins 10 caractères.")
      .max(5000, "La description ne doit pas dépasser 5000 caractères.")
      .optional(),

    status: z.enum(["DRAFT", "PUBLISHED"]).optional(),

    coverImageUrl: z
      .string()
      .trim()
      .url("L'URL de l'image est invalide.")
      .optional()
      .or(z.literal("")),
  })
  
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;