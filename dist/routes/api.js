"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../api/user/user.controller");
const home_controller_1 = require("../api/home/home.controller");
const game_controller_1 = require("../api/game/game.controller");
const router = (0, express_1.Router)();
// Define all routes here (like PHP api.php)
/**
 * @openapi
 * /api/user:
 *   get:
 *     summary: Returns User Data
 *     tags:
 *       - User
 *     responses:
 *       200:
 *         description: A successful hello response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Hello, World!
 */
router.get("/user", user_controller_1.getUser);
/**
 * @openapi
 * /api/home:
 *   get:
 *     summary: Returns Home Data
 *     tags:
 *       - Home
 *     responses:
 *       200:
 *         description: A successful hello response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Hello, World!
 */
router.get("/home", home_controller_1.GetHome);
/**
 * @openapi
 * /api/game/available:
 *   get:
 *     summary: Get Available Casino Games
 *     tags:
 *       - Game
 *     responses:
 *       200:
 *         description: List of available casino games
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 games:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: number
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: Blackjack
 */
router.get("/game/available", game_controller_1.getAvailableGames);
// Add more routes:
// router.post("/login", login)
// router.get("/wallet/balance", checkWallet)
exports.default = router;
