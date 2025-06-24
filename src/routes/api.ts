import { Router } from "express";
import { getUser } from "../api/user.controller";
import { GetHome } from "../api/home.controller";

const router = Router();

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
// Add more routes:
  // router.post("/login", login)
  // router.get("/wallet/balance", checkWallet)

export default router;