import { z } from 'zod';

// Registration collects the full profile (BACKEND_PLAN.md "Register" flow).
// Kept intentionally light on rules — the client wants a low-friction signup;
// email format + minimum password length are the only hard constraints.
export const registerSchema = z.object({
  firstName: z.string().trim().min(1, 'Le prénom est requis.'),
  lastName: z.string().trim().min(1, 'Le nom est requis.'),
  email: z.string().trim().toLowerCase().email('Email invalide.'),
  username: z
    .string()
    .trim()
    .min(3, "Le nom d'utilisateur doit faire au moins 3 caractères."),
  password: z
    .string()
    .min(6, 'Le mot de passe doit faire au moins 6 caractères.'),
});
export type RegisterDto = z.infer<typeof registerSchema>;

// Login accepts an email OR a username in a single `identifier` field, matching
// the native app's "IDENTIFIANT" input.
export const loginSchema = z.object({
  identifier: z.string().trim().min(1, "Identifiant requis."),
  password: z.string().min(1, 'Mot de passe requis.'),
});
export type LoginDto = z.infer<typeof loginSchema>;

export const activateSchema = z.object({
  code: z.string().trim().min(1, "Code d'activation requis."),
});
export type ActivateDto = z.infer<typeof activateSchema>;
