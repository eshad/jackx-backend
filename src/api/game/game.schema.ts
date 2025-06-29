import { z } from 'zod';

// Schema for placing a bet
export const PlaceBetSchema = z.object({
  game_id: z.number().positive("Game ID must be a positive number"),
  bet_amount: z.number().positive("Bet amount must be positive"),
  game_data: z.any().optional(), // Optional game-specific data
});

// Schema for processing bet result
export const ProcessBetResultSchema = z.object({
  bet_id: z.number().positive("Bet ID must be a positive number"),
  outcome: z.enum(['win', 'lose'], {
    errorMap: () => ({ message: "Outcome must be either 'win' or 'lose'" })
  }),
  win_amount: z.number().min(0, "Win amount must be non-negative").optional(),
  game_result: z.any().optional(), // Optional game result data
});

// Schema for recording game play
export const RecordGamePlaySchema = z.object({
  game_id: z.number().positive("Game ID must be a positive number"),
  play_time_seconds: z.number().min(0, "Play time must be non-negative").optional(),
});

// Schema for toggling game favorite
export const ToggleGameFavoriteSchema = z.object({
  game_id: z.number().positive("Game ID must be a positive number"),
});

// Schema for playing a game
export const PlayGameSchema = z.object({
  game_id: z.number().positive("Game ID must be a positive number"),
});

// Schema for game filters (query parameters)
export const GameFiltersSchema = z.object({
  category: z.string().optional(),
  provider: z.string().optional(),
  is_featured: z.string().transform(val => val === 'true').optional(),
  is_new: z.string().transform(val => val === 'true').optional(),
  is_hot: z.string().transform(val => val === 'true').optional(),
  search: z.string().optional(),
  limit: z.string().transform(val => parseInt(val)).optional(),
  offset: z.string().transform(val => parseInt(val)).optional(),
});

// Types
export type PlaceBetInput = z.infer<typeof PlaceBetSchema>;
export type ProcessBetResultInput = z.infer<typeof ProcessBetResultSchema>;
export type RecordGamePlayInput = z.infer<typeof RecordGamePlaySchema>;
export type ToggleGameFavoriteInput = z.infer<typeof ToggleGameFavoriteSchema>;
export type PlayGameInput = z.infer<typeof PlayGameSchema>;
export type GameFiltersInput = z.infer<typeof GameFiltersSchema>; 