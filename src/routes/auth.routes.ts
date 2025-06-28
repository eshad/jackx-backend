import express from "express";
import { login, register, refreshToken, getUserRoles } from "../api/auth/auth.controller";
import { LoginSchema, RegisterSchema } from "../api/auth/auth.schema";
import { validate } from "../middlewares/validate";

const router = express.Router();

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
router.post("/login", validate({ body: LoginSchema }), login);

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
router.post("/register", validate({ body: RegisterSchema }), register);

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
router.post("/refresh", refreshToken);

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
router.get("/user-roles", getUserRoles);

export default router;