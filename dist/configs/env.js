"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const zod_1 = require("zod");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const envSchema = zod_1.z.object({
    PORT: zod_1.z.string().default('3000'),
    NODE_ENV: zod_1.z.enum(['development', 'production']).default('development'),
    DB_PORT: zod_1.z.string(),
    DB_HOST: zod_1.z.string(),
    DB_USER: zod_1.z.string(),
    DB_PASS: zod_1.z.string(),
    DB_NAME: zod_1.z.string(),
    MONGO_URI: zod_1.z.string(),
    JWT_ACCESS_SECRET: zod_1.z.string(),
    JWT_REFRESH_SECRET: zod_1.z.string(),
    JWT_ACCESS_TOKEN_EXPIRES: zod_1.z.string().regex(/^\d+[smhdwy]$/, "Must be a valid JWT duration like 1h, 15m, 7d").default('1500000000000m'), //1h
    JWT_REFRESH_TOKEN_EXPIRES: zod_1.z.string().regex(/^\d+[smhdwy]$/, "Must be a valid JWT duration like 7d, 30d").default('10000000h'), //7d
});
const _env = envSchema.safeParse(process.env);
if (!_env.success) {
    console.error('Invalid environment variables:', _env.error.format());
    process.exit(1);
}
exports.env = _env.data;
