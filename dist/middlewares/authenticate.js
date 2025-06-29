"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../configs/config");
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ status: 401, message: "Missing or invalid token" });
        return;
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, config_1.Config.jwt.accessSecret);
        req.user = decoded;
        next();
    }
    catch (err) {
        console.error("JWT error:", err);
        res.status(401).json({ status: 401, message: "Invalid or expired token" });
    }
};
exports.authenticate = authenticate;
