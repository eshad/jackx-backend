import { z } from 'zod';

export const TokenPayloadSchema = z.object({
  userId: z.string(),
  username: z.string(),
  // Optional fields if needed
  role: z.string().optional(),
  iat: z.number().optional(),
  exp: z.number().optional(),
});

export type TokenPayload = z.infer<typeof TokenPayloadSchema>;