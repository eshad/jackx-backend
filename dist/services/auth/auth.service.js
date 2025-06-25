"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerService = exports.loginService = void 0;
const postgres_1 = __importDefault(require("../../db/postgres"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const messages_1 = require("../../constants/messages");
const auth_query_1 = require("../../api/auth/auth.query");
const jwt_service_1 = require("../jwt/jwt.service");
const apiError_1 = require("../../utils/apiError");
const jwtService = new jwt_service_1.JwtService();
const loginService = async (reqBody) => {
    try {
        let username = reqBody.username;
        const result = await postgres_1.default.query("SELECT * FROM users WHERE username = $1", [username]);
        if (result.rows.length === 0) {
            throw new apiError_1.ApiError(messages_1.ErrorMessages.INVALID_CREDENTIALS, 401);
        }
        let password = reqBody.password;
        const user = result.rows[0];
        // Compare hashed password
        const isMatch = await bcrypt_1.default.compare(password, user.password);
        if (!isMatch) {
            throw new apiError_1.ApiError(messages_1.ErrorMessages.INVALID_CREDENTIALS, 401);
        }
        // Sign JWT
        const payload = { userId: user.id, username: user.username };
        const accessToken = jwtService.signAccessToken(payload);
        const refreshToken = jwtService.signRefreshToken(payload);
        return {
            access_token: accessToken,
            refresh_token: refreshToken
        };
    }
    catch (err) {
        //TODO: winston, pino
        console.error(`[Login Error] ${err instanceof Error ? err.message : err}`);
        throw err;
    }
};
exports.loginService = loginService;
const registerService = async (reqBody) => {
    try {
        let username = reqBody.username;
        let email = reqBody.email;
        let password = reqBody.password;
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const result = await postgres_1.default.query(auth_query_1.Query.REGISTER_USER, [username, email, hashedPassword]);
        if (result.rowCount === 0) {
            //Unlikely happend because Active is default created data in DB
            throw new apiError_1.ApiError('Status "Active" not found', 404);
        }
        else {
            return messages_1.SuccessMessages.REGISTER_SUCCESS;
        }
    }
    catch (err) {
        console.error(`[Register Error] ${err instanceof Error ? err.message : err}`);
        throw err;
    }
};
exports.registerService = registerService;
