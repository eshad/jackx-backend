"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshToken = exports.refreshTokenService = exports.registerService = exports.loginService = void 0;
const postgres_1 = __importDefault(require("../../db/postgres"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const messages_1 = require("../../constants/messages");
const auth_query_1 = require("../../api/auth/auth.query");
const jwt_service_1 = require("../jwt/jwt.service");
const apiError_1 = require("../../utils/apiError");
const user_service_1 = require("../user/user.service");
const jwtService = new jwt_service_1.JwtService();
const loginService = async (username, password, roleId) => {
    const user = await (0, user_service_1.getUserByUsernameService)(username);
    if (!user) {
        throw new apiError_1.ApiError(messages_1.ErrorMessages.INVALID_CREDENTIALS, 401);
    }
    const isPasswordValid = await bcrypt_1.default.compare(password, user.password);
    if (!isPasswordValid) {
        throw new apiError_1.ApiError(messages_1.ErrorMessages.INVALID_CREDENTIALS, 401);
    }
    // Get user roles
    const userRolesResult = await postgres_1.default.query("SELECT r.id, r.name FROM user_roles ur JOIN roles r ON ur.role_id = r.id WHERE ur.user_id = $1", [user.id]);
    const userRoles = userRolesResult.rows;
    if (userRoles.length === 0) {
        throw new apiError_1.ApiError('User has no assigned roles', 401);
    }
    // Determine which role to use
    let selectedRole = userRoles.find(role => role.name === "player"); // Default to player
    if (roleId) {
        const requestedRole = userRoles.find(role => role.id === roleId);
        if (requestedRole) {
            selectedRole = requestedRole;
        }
    }
    if (!selectedRole) {
        throw new Error("No valid role found for user");
    }
    const payload = {
        userId: user.id,
        username: user.username,
        role: selectedRole.name,
        roleId: selectedRole.id
    };
    const accessToken = jwtService.signAccessToken(payload);
    const refreshToken = jwtService.signRefreshToken(payload);
    return {
        access_token: accessToken,
        refresh_token: refreshToken
    };
};
exports.loginService = loginService;
const registerService = async (reqBody) => {
    try {
        const { username, email, password } = reqBody;
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        // Start transaction
        const client = await postgres_1.default.connect();
        try {
            await client.query('BEGIN');
            // Create user
            const userResult = await client.query(auth_query_1.Query.REGISTER_USER, [username, email, hashedPassword]);
            if (userResult.rows.length === 0) {
                throw new apiError_1.ApiError('User creation failed', 500);
            }
            const userId = userResult.rows[0].id;
            // Assign default Player role
            const playerRoleResult = await client.query("SELECT id FROM roles WHERE name = 'Player'");
            if (playerRoleResult.rows.length === 0) {
                throw new apiError_1.ApiError('Default role not found', 500);
            }
            const playerRoleId = playerRoleResult.rows[0].id;
            await client.query("INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)", [userId, playerRoleId]);
            // Create initial balance for the new user
            await client.query("INSERT INTO user_balances (user_id, balance) VALUES ($1, $2)", [userId, 0.00]);
            // Create user profile
            await client.query("INSERT INTO user_profiles (user_id) VALUES ($1)", [userId]);
            // Assign Bronze level
            const bronzeLevelResult = await client.query("SELECT id FROM user_levels WHERE name = 'Bronze'");
            if (bronzeLevelResult.rows.length > 0) {
                const bronzeLevelId = bronzeLevelResult.rows[0].id;
                await client.query("INSERT INTO user_level_progress (user_id, level_id, current_points, total_points_earned) VALUES ($1, $2, $3, $4)", [userId, bronzeLevelId, 0, 0]);
            }
            await client.query('COMMIT');
            return messages_1.SuccessMessages.REGISTER_SUCCESS;
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
    catch (err) {
        console.error(`[Register Error] ${err instanceof Error ? err.message : err}`);
        throw err;
    }
};
exports.registerService = registerService;
const refreshTokenService = async (refreshToken) => {
    try {
        const decoded = jwtService.verifyRefreshToken(refreshToken);
        const user = await (0, user_service_1.getUserByUsernameService)(decoded.username);
        if (!user) {
            throw new Error("User not found");
        }
        const payload = {
            userId: user.id,
            username: user.username,
            role: decoded.role,
            roleId: decoded.roleId
        };
        const accessToken = jwtService.signAccessToken(payload);
        const newRefreshToken = jwtService.signRefreshToken(payload);
        return {
            access_token: accessToken,
            refresh_token: newRefreshToken
        };
    }
    catch (error) {
        throw new Error("Invalid refresh token");
    }
};
exports.refreshTokenService = refreshTokenService;
const refreshToken = async (req, res, next) => {
    try {
        const refreshToken = req.body?.refresh_token;
        if (!refreshToken) {
            res.status(400).json({
                success: false,
                message: "Refresh token is required"
            });
            return;
        }
        const tokens = await (0, exports.refreshTokenService)(refreshToken);
        res.json({
            success: true,
            message: "Tokens refreshed successfully",
            data: tokens
        });
    }
    catch (error) {
        res.status(401).json({
            success: false,
            message: error.message
        });
    }
};
exports.refreshToken = refreshToken;
