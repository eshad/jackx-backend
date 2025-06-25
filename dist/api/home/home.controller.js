"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetHome = void 0;
const GetHome = (_req, res, _next) => {
    res.status(200).json({ message: "HOME , DATA!" });
};
exports.GetHome = GetHome;
