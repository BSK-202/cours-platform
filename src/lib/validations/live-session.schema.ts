
import { z } from "zod";

export const createLiveSessionSchema = z.object({
  title: z.string().trim().min(3, "Le titre doit contenir au moins 3 caractères.").max(150),
  description: z.string().trim().max(5000).optional(),
  startsAt: z.string().datetime({
    message: "La date de début est invalide. Utilisez le format ISO 8601.",
  }),
  meetingUrl: z.string().trim().url("Le lien de réunion est invalide.").max(2048),
});

export const updateLiveSessionSchema = z.object({
  title: z.string().trim().min(3).max(150).optional(),
  description: z.string().trim().max(5000).nullable().optional(),
  startsAt: z.string().datetime().optional(),
  meetingUrl: z.string().trim().url().max(2048).optional(),
}).strict().refine(
  (data) => Object.keys(data).length > 0,
  "Au moins un champ doit être fourni."
);

export type CreateLiveSessionInput = z.infer<typeof createLiveSessionSchema>;
export type UpdateLiveSessionInput = z.infer<typeof updateLiveSessionSchema>;
