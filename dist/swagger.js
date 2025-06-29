"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerSpec = exports.setupSwagger = exports.options = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swaggerDefinition = {
    openapi: "3.0.0",
    info: {
        title: "JackpotX API",
        version: "1.0.0",
        description: "API documentation for JackpotX backend",
    },
    components: {
        securitySchemes: {
            BearerAuth: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT",
            },
        },
    },
    security: [
        {
            BearerAuth: [],
        },
    ],
};
exports.options = {
    swaggerDefinition,
    apis: ["./src/routes/**/*.ts", "./src/api/**/*.ts"],
};
const swaggerSpec = (0, swagger_jsdoc_1.default)(exports.options);
exports.swaggerSpec = swaggerSpec;
const setupSwagger = (app) => {
    console.log("Loaded Swagger paths:", Object.keys(swaggerSpec.paths));
    app.get("/api-docs.json", (_req, res) => {
        res.setHeader("Content-Type", "application/json");
        res.send(swaggerSpec);
    });
    app.use("/docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(undefined, {
        swaggerOptions: {
            persistAuthorization: true,
            urls: [
                {
                    url: "https://backend.jackpotx.net/api-docs.json",
                    name: "Production (HTTPS)",
                },
                {
                    url: "http://185.209.229.198:3000/api-docs.json",
                    name: "Local (HTTP)",
                },
            ],
            urlsPrimaryName: "Production (HTTPS)",
            docExpansion: "none",
            validatorUrl: null,
        },
    }));
    app.get("/", (_req, res) => {
        res.redirect("/docs");
    });
};
exports.setupSwagger = setupSwagger;
