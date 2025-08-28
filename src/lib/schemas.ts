import { z } from 'zod';

// Deck schemas
export const CreateDeckSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name too long'),
  description: z.string().max(1000, 'Description too long').optional(),
});

export const UpdateDeckSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name too long').optional(),
  description: z.string().max(1000, 'Description too long').optional(),
});

// Card schemas
export const CreateCardSchema = z.object({
  deckId: z.number().int().positive('Invalid deck ID'),
  front: z.string().min(1, 'Front side is required'),
  back: z.string().min(1, 'Back side is required'),
});

export const UpdateCardSchema = z.object({
  front: z.string().min(1, 'Front side is required').optional(),
  back: z.string().min(1, 'Back side is required').optional(),
});

// Export TypeScript types from Zod schemas
export type CreateDeckInput = z.infer<typeof CreateDeckSchema>;
export type UpdateDeckInput = z.infer<typeof UpdateDeckSchema>;
export type CreateCardInput = z.infer<typeof CreateCardSchema>;
export type UpdateCardInput = z.infer<typeof UpdateCardSchema>;
