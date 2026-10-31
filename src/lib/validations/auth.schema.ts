
import { z } from "zod";

// --------------------
// SIGNUP
// --------------------

export const signupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100, "Le nom ne doit pas dépasser 100 caractères"),

  email: z
    .string()
    .trim()
    .email("Adresse email invalide")
    .max(254, "Adresse email trop longue"),

  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .max(72, "Le mot de passe est trop long"),
});

// --------------------
// LOGIN
// --------------------

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Adresse email invalide")
    .max(254, "Adresse email trop longue"),

  password: z
    .string()
    .min(1, "Le mot de passe est obligatoire")
    .max(72, "Le mot de passe est trop long"),
});

// --------------------
// TYPESCRIPT TYPES
// --------------------

export type SignupInput = z.infer<typeof signupSchema>;

export type LoginInput = z.infer<typeof loginSchema>;
