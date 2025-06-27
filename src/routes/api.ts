import { Router } from "express";
import { getUserBalance } from "../api/user/user.controller";
import { GetHome } from "../api/home/home.controller";
import { getAvailableGames } from "../api/game/game.controller";
import { authenticate } from "../middlewares/authenticate";
import { authorize } from "../middlewares/authorize";
const router = Router();

// Define all routes here (like PHP api.php)


/**
 * @openapi
 * /api/user/balance:
 *   get:
 *     summary: Get user info and balance
 *     tags:
 *       - User
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully returns user info with balance
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     username:
 *                       type: string
 *                       example: johndoe
 *                     email:
 *                       type: string
 *                       example: johndoe@example.com
 *                     balance:
 *                       type: number
 *                       format: float
 *                       example: 100.50
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 */
router.get("/user/balance", authenticate, getUserBalance);

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
router.get("/home", GetHome);

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
router.get("/game/available", getAvailableGames);

// Add more routes:
  // router.post("/login", login)
  // router.get("/wallet/balance", checkWallet)

export default router;