"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = void 0;
const authorize = (allowedRoles) => (req, res, next) => {
    const user = req.user;
    if (!user || !user.role) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized: No user found",
        });
    }
    if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({
            success: false,
            message: "Forbidden: Insufficient permissions",
        });
    }
    next();
};
exports.authorize = authorize;
