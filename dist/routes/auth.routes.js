"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = require("../api/auth/auth.controller");
const auth_schema_1 = require("../api/auth/auth.schema");
const validate_1 = require("../middlewares/validate");
const router = express_1.default.Router();
/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Login with username and password
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: player1
 *               password:
 *                 type: string
 *                 example: qwer1234
 *               role_id:
 *                 type: number
 *                 optional: true
 *                 description: Optional role ID to login with specific role. If not provided, defaults to Player role.
 *                 example: 2
 *     responses:
 *       200:
 *         description: Login success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Logged in successfully
 *                 token:
 *                   type: object
 *                   properties:
 *                     access_token:
 *                       type: string
 *                       example: eyJhbGciOi...
 *                     refresh_token:
 *                       type: string
 *                       example: eyJhbGciOi...
 *                     role:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: number
 *                           example: 1
 *                         username:
 *                           type: string
 *                           example: player1
 *                         name:
 *                           type: string
 *                           example: Player
 *                         description:
 *                           type: string
 *                           example: Regular player account
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", (0, validate_1.validate)({ body: auth_schema_1.LoginSchema }), auth_controller_1.login);
/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: user01
 *               email:
 *                 type: string
 *                 example: user@live.com
 *               password:
 *                 type: string
 *                 example: qwer1234
 *     responses:
 *       200:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Registration successful
 *       400:
 *         description: Validation failed
 */
router.post("/register", (0, validate_1.validate)({ body: auth_schema_1.RegisterSchema }), auth_controller_1.register);
/**
 * @openapi
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh JWT tokens
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refresh_token:
 *                 type: string
 *                 example: your_refresh_token_here
 *     responses:
 *       200:
 *         description: New tokens generated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 token:
 *                   type: object
 *                   properties:
 *                     access_token:
 *                       type: string
 *                     refresh_token:
 *                       type: string
 */
router.post("/refresh", auth_controller_1.refreshToken);
/**
 * @openapi
 * /api/auth/user-roles:
 *   get:
 *     summary: Get available roles for a user
 *     tags:
 *       - Auth
 *     parameters:
 *       - in: query
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: Username to get roles for
 *         example: player1
 *     responses:
 *       200:
 *         description: User roles retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: number
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: Player
 *                       description:
 *                         type: string
 *                         example: Regular player account
 *       400:
 *         description: Username is required
 *       401:
 *         description: User not found
 */
router.get("/user-roles", auth_controller_1.getUserRoles);
exports.default = router;
