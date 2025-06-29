"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserRoles = exports.refreshToken = exports.register = exports.login = void 0;
const auth_service_1 = require("../../services/auth/auth.service");
const user_service_1 = require("../../services/user/user.service");
const messages_1 = require("../../constants/messages");
const login = async (req, res, next) => {
    try {
        const reqBody = req.validated?.body;
        const response = await (0, auth_service_1.loginService)(reqBody.username, reqBody.password, reqBody.role_id);
        res.json({ success: true, message: messages_1.SuccessMessages.LOGIN_SUCCESS, token: response });
    }
    catch (err) {
        next(err);
    }
};
exports.login = login;
const register = async (req, res, next) => {
    try {
        const reqBody = req.validated?.body;
        const response = await (0, auth_service_1.registerService)(reqBody);
        res.json({ success: true, message: response });
    }
    catch (err) {
        next(err);
    }
};
exports.register = register;
// ✅ This was missing
exports.refreshToken = auth_service_1.refreshToken;
const getUserRoles = async (req, res, next) => {
    try {
        const { username } = req.query;
        if (!username || typeof username !== 'string') {
            res.status(400).json({ success: false, message: "Username is required" });
            return;
        }
        const roles = await (0, user_service_1.getUserRolesService)(username);
        res.json({ success: true, data: roles });
    }
    catch (err) {
        next(err);
    }
};
exports.getUserRoles = getUserRoles;
