"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSwagger = void 0;
// src/swagger.ts
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swaggerDefinition = {
    openapi: "3.0.0",
    info: {
        title: "JackpotX API",
        version: "1.0.0",
        description: "API documentation for JackpotX backend",
    },
    servers: [
        {
            url: "http://localhost:3000",
            description: "Local server",
        },
    ],
    paths: {},
};
const options = {
    swaggerDefinition,
    apis: ["./src/routes/**/*.ts", "./src/index.ts"],
};
const swaggerSpec = (0, swagger_jsdoc_1.default)(options);
const setupSwagger = (app) => {
    app.use("/docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerSpec));
};
exports.setupSwagger = setupSwagger;
