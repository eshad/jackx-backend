import { z } from "zod";
import { ErrorMessages } from "../../constants/messages";

export const LoginSchema = z.object({
  username: z
    .string()
    .min(3, ErrorMessages.INVALID_CREDENTIALS),
  password: z
    .string()
    .min(6, ErrorMessages.INVALID_CREDENTIALS),
});

export const AuthHeaderSchema = z.object({
  authorization: z.string().startsWith("Bearer "),
});

export const RegisterSchema = z.object({
  username: z
    .string()
    .min(5, ErrorMessages.INVALID_USERNAME),
  email: z.string().email(ErrorMessages.INVALID_EMAIL),
  password: z
    .string()
    .min(8, ErrorMessages.INVALID_PASSWORD),
});

// ============================
// Type Definitions
// ============================

export type LoginInput = z.infer<typeof LoginSchema>;
export type AuthHeaderInput = z.infer<typeof AuthHeaderSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;

export type LoginResponse = {
  access_token: string;
  refresh_token: string;
  role: {
    id: number;
    name: string;
    description: string | null;
  };
};