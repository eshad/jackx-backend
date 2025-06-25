"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = require("./auth.controller");
const auth_schema_1 = require("./auth.schema");
const validate_1 = require("../../middlewares/validate");
const router = express_1.default.Router();
router.post("/login", (0, validate_1.validate)({ body: auth_schema_1.LoginSchema }), auth_controller_1.login);
router.post("/register", (0, validate_1.validate)({ body: auth_schema_1.RegisterSchema }), auth_controller_1.register);
exports.default = router;
