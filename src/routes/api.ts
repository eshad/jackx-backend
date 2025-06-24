import { Router } from "express";
import { getUser } from "../api/user/user.controller";
import { GetHome } from "../api/home/home.controller";
import { getAvailableGames } from "../api/game/game.controller";
const router = Router();

// Define all routes here (like PHP api.php)

app.get("/", (_req: Request, res: Response) => {
  res.redirect("/docs");
});

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
router.get("/user", getUser);

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