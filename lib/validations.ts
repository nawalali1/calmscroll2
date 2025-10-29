import { z } from 'zod';

// Note schemas
export const noteSchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string().uuid(),
  title: z.string().max(200).optional(),
  content: z.string().min(1).max(2000),
  mood: z.string().max(50).optional(),
  due_at: z.string().datetime().nullable().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export const createNoteSchema = noteSchema.pick({
  title: true,
  content: true,
  mood: true,
  due_at: true,
}).extend({
  content: z.string().min(1).max(2000),
});

export const updateNoteSchema = createNoteSchema.partial();

// Interest schemas
export const interestSchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string().uuid(),
  tag: z.string().min(1).max(50),
  created_at: z.string().datetime().optional(),
});

export const saveInterestsSchema = z.object({
  tags: z.array(z.string().min(1).max(50)).min(1),
});

// Reminder schemas
export const reminderSchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string().uuid(),
  note_id: z.string().uuid().nullable().optional(),
  kind: z.enum(['note', 'interest', 'nudge']),
  message: z.string().min(1).max(500),
  scheduled_for: z.string().datetime(),
  status: z.enum(['scheduled', 'sent', 'canceled']).default('scheduled'),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export const scheduleReminderSchema = reminderSchema.pick({
  kind: true,
  message: true,
  scheduled_for: true,
  note_id: true,
});

export const updateReminderSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['scheduled', 'sent', 'canceled']),
});

// Breath session schemas
export const breathSessionSchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string().uuid(),
  duration_seconds: z.number().int().positive().default(60),
  completed: z.boolean().default(false),
  started_at: z.string().datetime().optional(),
  completed_at: z.string().datetime().nullable().optional(),
});

export const logBreathSessionSchema = z.object({
  duration_seconds: z.number().int().positive(),
  completed: z.boolean(),
  completed_at: z.string().datetime().nullable().optional(),
});

// Profile schemas
export const profileSchema = z.object({
  id: z.string().uuid(),
  display_name: z.string().max(100).nullable().optional(),
  onboarding_complete: z.boolean().default(false),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export const updateProfileSchema = profileSchema.pick({
  display_name: true,
  onboarding_complete: true,
}).partial();

// Search query schema
export const searchSchema = z.object({
  q: z.string().min(1).max(100),
  limit: z.number().int().positive().max(100).default(20),
});

// Types
export type Note = z.infer<typeof noteSchema>;
export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;

export type Interest = z.infer<typeof interestSchema>;
export type SaveInterestsInput = z.infer<typeof saveInterestsSchema>;

export type Reminder = z.infer<typeof reminderSchema>;
export type ScheduleReminderInput = z.infer<typeof scheduleReminderSchema>;
export type UpdateReminderInput = z.infer<typeof updateReminderSchema>;

export type BreathSession = z.infer<typeof breathSessionSchema>;
export type LogBreathSessionInput = z.infer<typeof logBreathSessionSchema>;

export type Profile = z.infer<typeof profileSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;