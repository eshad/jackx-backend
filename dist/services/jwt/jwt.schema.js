"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenPayloadSchema = void 0;
const zod_1 = require("zod");
exports.TokenPayloadSchema = zod_1.z.object({
    userId: zod_1.z.string(),
    username: zod_1.z.string(),
    // Optional fields if needed
    role: zod_1.z.string().optional(),
    iat: zod_1.z.number().optional(),
    exp: zod_1.z.number().optional(),
});
