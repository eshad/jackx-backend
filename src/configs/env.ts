
import { z } from 'zod';
import dotenv from 'dotenv';
dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('3000'),
  NODE_ENV: z.enum(['development', 'production']).default('development'),

  DB_PORT: z.string(),
  DB_HOST: z.string(),
  DB_USER: z.string(),
  DB_PASS: z.string(),
  DB_NAME: z.string(),

  MONGO_URI: z.string(),

  JWT_ACCESS_SECRET: z.string(),
  JWT_REFRESH_SECRET: z.string(),
  JWT_ACCESS_TOKEN_EXPIRES: z.string().regex(/^\d+[smhdwy]$/, "Must be a valid JWT duration like 1h, 15m, 7d").default('1500000000000m'), //1h
  JWT_REFRESH_TOKEN_EXPIRES: z.string().regex(/^\d+[smhdwy]$/, "Must be a valid JWT duration like 7d, 30d").default('10000000h'), //7d
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('Invalid environment variables:', _env.error.format());
  process.exit(1);
}

export const env = _env.data;