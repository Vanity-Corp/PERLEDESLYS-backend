import { z } from 'zod';

// Zod schemas for content create/update. Field names/shapes mirror the native
// app's content types. PATCH uses the `.partial()` variants.

export const recipeSchema = z.object({
  id: z.string().min(1).optional(),
  title: z.string().min(1),
  image: z.string().min(1),
  time: z.string().min(1),
  difficulty: z.enum(['Facile', 'Moyen', 'Avancé']),
  category: z.string().min(1),
  portions: z.number().int().positive(),
  description: z.string(),
  cookidooUrl: z.string(),
  isNew: z.boolean().optional(),
  ingredients: z.array(z.object({ label: z.string(), qty: z.string() })),
  steps: z.array(z.string()),
});
export const recipeUpdateSchema = recipeSchema.partial();
export type RecipeDto = z.infer<typeof recipeSchema>;

export const videoSchema = z.object({
  id: z.string().min(1).optional(),
  title: z.string().min(1),
  image: z.string().min(1),
  duration: z.string().min(1),
  category: z.string().min(1),
  description: z.string(),
  vimeoUrl: z.string().optional(),
});
export const videoUpdateSchema = videoSchema.partial();
export type VideoDto = z.infer<typeof videoSchema>;

export const articleSchema = z.object({
  id: z.string().min(1).optional(),
  title: z.string().min(1),
  excerpt: z.string(),
  image: z.string().min(1),
  readTime: z.string().min(1),
  category: z.string().min(1),
});
export const articleUpdateSchema = articleSchema.partial();
export type ArticleDto = z.infer<typeof articleSchema>;

export const liveSchema = z.object({
  id: z.string().min(1).optional(),
  title: z.string().min(1),
  date: z.string().min(1),
  time: z.string().min(1),
  image: z.string().min(1),
  status: z.enum(['À venir', 'En direct', 'Replay']),
  description: z.string(),
  platform: z.string().min(1),
  vimeoUrl: z.string().optional(),
});
export const liveUpdateSchema = liveSchema.partial();
export type LiveDto = z.infer<typeof liveSchema>;

export const eventSchema = z.object({
  id: z.string().min(1).optional(),
  title: z.string().min(1),
  date: z.string().min(1),
  time: z.string().min(1),
  type: z.enum(['live', 'atelier', 'publication', 'rappel']),
  description: z.string().optional(),
});
export const eventUpdateSchema = eventSchema.partial();
export type EventDto = z.infer<typeof eventSchema>;

export const faqSchema = z.object({
  id: z.string().min(1).optional(),
  q: z.string().min(1),
  a: z.string().min(1),
  order: z.number().int().optional(),
});
export const faqUpdateSchema = faqSchema.partial();
export type FaqDto = z.infer<typeof faqSchema>;

export const welcomeMessageSchema = z.object({
  subject: z.string().min(1),
  body: z.string().min(1),
});
export type WelcomeMessageDto = z.infer<typeof welcomeMessageSchema>;

export const founderSchema = z.object({
  name: z.string().min(1),
  fullName: z.string().min(1),
  bio: z.string().min(1),
  avatar: z.string().min(1),
});
export type FounderDto = z.infer<typeof founderSchema>;
