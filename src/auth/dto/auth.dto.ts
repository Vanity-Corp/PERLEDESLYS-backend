import { z } from 'zod';

// Registration is username + password only (privacy — WIRING_PLAN B1). No name
// or email is collected, so there's nothing personal to leak.
export const registerSchema = z.object({
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
