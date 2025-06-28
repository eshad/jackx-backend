import { Router } from "express";
import { 
  getUserBalance, 
  getUserProfile, 
  getUserFavoriteGames, 
  getUserRecentActivity, 
  getUserTransactionHistory, 
  getUserBettingHistory 
} from "../api/user/user.controller";
import { GetHome } from "../api/home/home.controller";
import { 
  getAvailableGames,
  getGameById,
  getGameCategories,
  getGameProviders,
  getFeaturedGames,
  getNewGames,
  getHotGames,
  getPopularGames,
  getGameStatistics,
  toggleGameFavorite,
  recordGamePlay,
  placeBet,
  processBetResult,
  getAvailableGamesLegacy
} from "../api/game/game.controller";
import { authenticate } from "../middlewares/authenticate";
import { authorize } from "../middlewares/authorize";
import { validate } from "../middlewares/validate";
import { 
  PlaceBetSchema, 
  ProcessBetResultSchema, 
  RecordGamePlaySchema, 
  ToggleGameFavoriteSchema,
  GameFiltersSchema
} from "../api/game/game.schema";
const router = Router();

// Define all routes here (like PHP api.php)

/**
 * @openapi
 * /api/user/profile:
 *   get:
 *     summary: Get comprehensive user profile information
 *     tags:
 *       - User
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully returns comprehensive user profile
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
 *                     first_name:
 *                       type: string
 *                       example: John
 *                     last_name:
 *                       type: string
 *                       example: Doe
 *                     nationality:
 *                       type: string
 *                       example: United States
 *                     phone_number:
 *                       type: string
 *                       example: +1234567890
 *                     balance:
 *                       type: number
 *                       format: float
 *                       example: 100.50
 *                     level_name:
 *                       type: string
 *                       example: Silver
 *                     verification_level:
 *                       type: integer
 *                       example: 1
 *       401:
 *         description: Unauthorized
 */
router.get("/user/profile", authenticate, getUserProfile);

/**
 * @openapi
 * /api/user/favorite-games:
 *   get:
 *     summary: Get user's favorite and most played games
 *     tags:
 *       - User
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully returns user's favorite games
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
 *                         type: integer
 *                       name:
 *                         type: string
 *                       provider:
 *                         type: string
 *                       play_count:
 *                         type: integer
 *                       is_favorite:
 *                         type: boolean
 *       401:
 *         description: Unauthorized
 */
router.get("/user/favorite-games", authenticate, getUserFavoriteGames);

/**
 * @openapi
 * /api/user/activity:
 *   get:
 *     summary: Get user's recent activity
 *     tags:
 *       - User
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of activities to return
 *     responses:
 *       200:
 *         description: Successfully returns user's recent activity
 *       401:
 *         description: Unauthorized
 */
router.get("/user/activity", authenticate, getUserRecentActivity);

/**
 * @openapi
 * /api/user/transactions:
 *   get:
 *     summary: Get user's transaction history
 *     tags:
 *       - User
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of transactions to return
 *     responses:
 *       200:
 *         description: Successfully returns user's transaction history
 *       401:
 *         description: Unauthorized
 */
router.get("/user/transactions", authenticate, getUserTransactionHistory);

/**
 * @openapi
 * /api/user/bets:
 *   get:
 *     summary: Get user's betting history
 *     tags:
 *       - User
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of bets to return
 *     responses:
 *       200:
 *         description: Successfully returns user's betting history
 *       401:
 *         description: Unauthorized
 */
router.get("/user/bets", authenticate, getUserBettingHistory);

/**
 * @openapi
 * /api/user/balance:
 *   get:
 *     summary: Get user info and balance (legacy endpoint)
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
 * /api/games:
 *   get:
 *     summary: Get all available games with filtering
 *     tags:
 *       - Game
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by game category
 *       - in: query
 *         name: provider
 *         schema:
 *           type: string
 *         description: Filter by game provider
 *       - in: query
 *         name: is_featured
 *         schema:
 *           type: boolean
 *         description: Filter featured games
 *       - in: query
 *         name: is_new
 *         schema:
 *           type: boolean
 *         description: Filter new games
 *       - in: query
 *         name: is_hot
 *         schema:
 *           type: boolean
 *         description: Filter hot games
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search games by name or provider
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of games to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of games to skip
 *     responses:
 *       200:
 *         description: Successfully returns filtered games
 *       400:
 *         description: Invalid filter parameters
 */
router.get("/games", validate({ query: GameFiltersSchema }), getAvailableGames);

/**
 * @openapi
 * /api/games/{id}:
 *   get:
 *     summary: Get game by ID
 *     tags:
 *       - Game
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Game ID
 *     responses:
 *       200:
 *         description: Successfully returns game details
 *       404:
 *         description: Game not found
 */
router.get("/games/:id", getGameById);

/**
 * @openapi
 * /api/games/categories:
 *   get:
 *     summary: Get all game categories
 *     tags:
 *       - Game
 *     responses:
 *       200:
 *         description: Successfully returns game categories
 */
router.get("/games/categories", getGameCategories);

/**
 * @openapi
 * /api/games/providers:
 *   get:
 *     summary: Get all game providers
 *     tags:
 *       - Game
 *     responses:
 *       200:
 *         description: Successfully returns game providers
 */
router.get("/games/providers", getGameProviders);

/**
 * @openapi
 * /api/games/featured:
 *   get:
 *     summary: Get featured games
 *     tags:
 *       - Game
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of featured games to return
 *     responses:
 *       200:
 *         description: Successfully returns featured games
 */
router.get("/games/featured", getFeaturedGames);

/**
 * @openapi
 * /api/games/new:
 *   get:
 *     summary: Get new games
 *     tags:
 *       - Game
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of new games to return
 *     responses:
 *       200:
 *         description: Successfully returns new games
 */
router.get("/games/new", getNewGames);

/**
 * @openapi
 * /api/games/hot:
 *   get:
 *     summary: Get hot games
 *     tags:
 *       - Game
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of hot games to return
 *     responses:
 *       200:
 *         description: Successfully returns hot games
 */
router.get("/games/hot", getHotGames);

/**
 * @openapi
 * /api/games/popular:
 *   get:
 *     summary: Get popular games
 *     tags:
 *       - Game
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of popular games to return
 *     responses:
 *       200:
 *         description: Successfully returns popular games
 */
router.get("/games/popular", getPopularGames);

/**
 * @openapi
 * /api/games/{id}/statistics:
 *   get:
 *     summary: Get game statistics
 *     tags:
 *       - Game
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Game ID
 *     responses:
 *       200:
 *         description: Successfully returns game statistics
 *       404:
 *         description: Game not found
 */
router.get("/games/:id/statistics", getGameStatistics);

/**
 * @openapi
 * /api/games/favorite:
 *   post:
 *     summary: Toggle game favorite status
 *     tags:
 *       - Game
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - game_id
 *             properties:
 *               game_id:
 *                 type: integer
 *                 description: Game ID to toggle favorite
 *     responses:
 *       200:
 *         description: Successfully toggled favorite status
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Game not found
 */
router.post("/games/favorite", authenticate, validate({ body: ToggleGameFavoriteSchema }), toggleGameFavorite);

/**
 * @openapi
 * /api/games/play:
 *   post:
 *     summary: Record game play
 *     tags:
 *       - Game
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - game_id
 *             properties:
 *               game_id:
 *                 type: integer
 *                 description: Game ID
 *               play_time_seconds:
 *                 type: integer
 *                 description: Time played in seconds
 *     responses:
 *       200:
 *         description: Successfully recorded game play
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Game not found
 */
router.post("/games/play", authenticate, validate({ body: RecordGamePlaySchema }), recordGamePlay);

/**
 * @openapi
 * /api/games/bet:
 *   post:
 *     summary: Place a bet on a game
 *     tags:
 *       - Game
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - game_id
 *               - bet_amount
 *             properties:
 *               game_id:
 *                 type: integer
 *                 description: Game ID
 *               bet_amount:
 *                 type: number
 *                 description: Bet amount
 *               game_data:
 *                 type: object
 *                 description: Optional game-specific data
 *     responses:
 *       200:
 *         description: Successfully placed bet
 *       400:
 *         description: Invalid bet amount or insufficient balance
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Game not found
 */
router.post("/games/bet", authenticate, validate({ body: PlaceBetSchema }), placeBet);

/**
 * @openapi
 * /api/games/bet/result:
 *   post:
 *     summary: Process bet result (admin only)
 *     tags:
 *       - Game
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bet_id
 *               - outcome
 *             properties:
 *               bet_id:
 *                 type: integer
 *                 description: Bet ID
 *               outcome:
 *                 type: string
 *                 enum: [win, lose]
 *                 description: Bet outcome
 *               win_amount:
 *                 type: number
 *                 description: Win amount (if outcome is win)
 *               game_result:
 *                 type: object
 *                 description: Optional game result data
 *     responses:
 *       200:
 *         description: Successfully processed bet result
 *       400:
 *         description: Invalid bet data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Bet not found
 */
router.post("/games/bet/result", authenticate, authorize(['admin']), validate({ body: ProcessBetResultSchema }), processBetResult);

// Legacy game endpoint for backward compatibility
/**
 * @openapi
 * /api/game/available:
 *   get:
 *     summary: Get Available Casino Games (legacy endpoint)
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
router.get("/game/available", getAvailableGamesLegacy);

// Add more routes:
  // router.post("/login", login)
  // router.get("/wallet/balance", checkWallet)

export default router;