"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
// Routes
const auth_routes_1 = __importDefault(require("./api/auth/auth.routes"));
// import userRoutes from "./api/user/user.routes";
// Middleware
const errorHandler_1 = __importDefault(require("./middlewares/errorHandler"));
const mongo_1 = require("./db/mongo");
const app = (0, express_1.default)();
(async () => {
    await (0, mongo_1.connectMongo)();
})();
app.set("trust proxy", 1);
// Security headers
app.use((0, helmet_1.default)());
// Enable CORS
app.use((0, cors_1.default)());
// Gzip compression
app.use((0, compression_1.default)());
// Parse JSON and URL-encoded payloads
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Parse cookies
app.use((0, cookie_parser_1.default)());
// Rate limiting (100 requests per 15 minutes)
app.use((0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
}));
// Logging
const env = process.env.NODE_ENV || "development";
if (env === "production") {
    const accessLogStream = fs_1.default.createWriteStream(path_1.default.join(process.cwd(), "access.log"), { flags: "a" });
    app.use((0, morgan_1.default)("combined", { stream: accessLogStream }));
}
else {
    app.use((0, morgan_1.default)("dev"));
}
// Routes
app.get('/', (_req, res) => {
    res.json({ message: 'OK' });
});
app.use("/api/auth", auth_routes_1.default);
// app.use("/api/users", userRoutes);
// Error handler (should be last)
app.use(errorHandler_1.default);
exports.default = app;
