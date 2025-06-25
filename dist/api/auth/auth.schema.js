"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterSchema = exports.AuthHeaderSchema = exports.LoginSchema = void 0;
const zod_1 = require("zod");
const messages_1 = require("../../constants/messages");
exports.LoginSchema = zod_1.z.object({
    username: zod_1.z
        .string()
        .min(3, messages_1.ErrorMessages.INVALID_CREDENTIALS),
    password: zod_1.z
        .string()
        .min(6, messages_1.ErrorMessages.INVALID_CREDENTIALS),
});
exports.AuthHeaderSchema = zod_1.z.object({
    authorization: zod_1.z.string().startsWith("Bearer "),
});
exports.RegisterSchema = zod_1.z.object({
    username: zod_1.z
        .string()
        .min(5, messages_1.ErrorMessages.INVALID_USERNAME),
    email: zod_1.z.string().email(messages_1.ErrorMessages.INVALID_EMAIL),
    password: zod_1.z
        .string()
        .min(8, messages_1.ErrorMessages.INVALID_PASSWORD),
});
