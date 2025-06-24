"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = exports.login = void 0;
const auth_service_1 = require("./auth.service");
const messages_1 = require("../../constants/messages");
const login = async (req, res, next) => {
    try {
        const reqBody = req.validated?.body;
        const response = await (0, auth_service_1.loginService)(reqBody);
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
