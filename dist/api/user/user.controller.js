"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUser = void 0;
const getUser = (_req, res, _next) => {
    res.status(200).json({ message: "Hello, World!" });
};
exports.getUser = getUser;
