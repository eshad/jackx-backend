"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errorHandler = (err, req, res, next) => {
    console.error(`[Error] ${err.message}`);
    const statusCode = err.statusCode || 500;
    const status = err.status || "error";
    res.status(statusCode).json({
        status,
        message: err.message || "Something went wrong",
    });
};
exports.default = errorHandler;
