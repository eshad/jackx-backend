import { Router } from "express";
import { validate as validateRequest } from "../middlewares/validate";
import { authenticate } from "../middlewares/authenticate";
import { authorize } from "../middlewares/authorize";
import {
  CreateGameInput,
  UpdateGameInput,
  UserFiltersInput,
  UpdateUserStatusInput,
  UpdateUserBalanceInput
} from "../api/admin/admin.schema";
import {
  // Game Management
  createGame,
  updateGame,
  deleteGame,
  getGamesForAdmin,
  // User Management
  getUsersForAdmin,
  updateUserStatus,
  updateUserBalance,
  // Dashboard
  getDashboardStats,
  // Provider Management
  getProviders,
  createProvider,
  // Transaction Management
  getTransactionsForAdmin,
  approveTransaction,
  // Settings
  getSystemSettings,
  updateSystemSettings,
  // Analytics
  getRevenueAnalytics,
  getUserAnalytics
} from "../api/admin/admin.controller";

const router = Router();

// Apply authentication and admin role middleware to all routes
router.use(authenticate);
router.use(authorize(["Admin", "Manager"]));

// =====================================================
// DASHBOARD ROUTES
// =====================================================

/**
 * @swagger
 * /api/admin/dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Admin Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalUsers:
 *                       type: number
 *                     totalGames:
 *                       type: number
 *                     todayTransactions:
 *                       type: number
 *                     todayAmount:
 *                       type: number
 *                     pendingTransactions:
 *                       type: number
 *                     pendingAmount:
 *                       type: number
 *                     todayWagered:
 *                       type: number
 */
router.get("/dashboard/stats", getDashboardStats);

// =====================================================
// GAME MANAGEMENT ROUTES
// =====================================================

/**
 * @swagger
 * /api/admin/games:
 *   get:
 *     summary: Get all games for admin
 *     tags: [Admin Games]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: provider
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: is_active
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Games retrieved successfully
 */
router.get("/games", getGamesForAdmin);

/**
 * @swagger
 * /api/admin/games:
 *   post:
 *     summary: Create a new game
 *     tags: [Admin Games]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - provider
 *               - category
 *               - game_code
 *             properties:
 *               name:
 *                 type: string
 *               provider:
 *                 type: string
 *               category:
 *                 type: string
 *               subcategory:
 *                 type: string
 *               image_url:
 *                 type: string
 *               game_code:
 *                 type: string
 *               rtp_percentage:
 *                 type: number
 *               volatility:
 *                 type: string
 *                 enum: [low, medium, high]
 *               min_bet:
 *                 type: number
 *               max_bet:
 *                 type: number
 *               is_featured:
 *                 type: boolean
 *               is_new:
 *                 type: boolean
 *               is_hot:
 *                 type: boolean
 *               is_active:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Game created successfully
 */
router.post("/games", validateRequest({ body: CreateGameInput }), createGame);

/**
 * @swagger
 * /api/admin/games/{id}:
 *   put:
 *     summary: Update a game
 *     tags: [Admin Games]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateGameInput'
 *     responses:
 *       200:
 *         description: Game updated successfully
 */
router.put("/games/:id", validateRequest({ body: UpdateGameInput }), updateGame);

/**
 * @swagger
 * /api/admin/games/{id}:
 *   delete:
 *     summary: Delete a game
 *     tags: [Admin Games]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Game deleted successfully
 */
router.delete("/games/:id", deleteGame);

// =====================================================
// USER MANAGEMENT ROUTES
// =====================================================

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users for admin
 *     tags: [Admin Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: verification_level
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 */
router.get("/users", getUsersForAdmin);

/**
 * @swagger
 * /api/admin/users/{id}/status:
 *   put:
 *     summary: Update user status
 *     tags: [Admin Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Active, Inactive, Suspended, Banned]
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: User status updated successfully
 */
router.put("/users/:id/status", validateRequest({ body: UpdateUserStatusInput }), updateUserStatus);

/**
 * @swagger
 * /api/admin/users/{id}/balance:
 *   put:
 *     summary: Update user balance
 *     tags: [Admin Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - type
 *             properties:
 *               amount:
 *                 type: number
 *               type:
 *                 type: string
 *                 enum: [deposit, withdrawal, adjustment]
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: User balance updated successfully
 */
router.put("/users/:id/balance", validateRequest({ body: UpdateUserBalanceInput }), updateUserBalance);

// =====================================================
// PROVIDER MANAGEMENT ROUTES
// =====================================================

/**
 * @swagger
 * /api/admin/providers:
 *   get:
 *     summary: Get all payment providers
 *     tags: [Admin Providers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Providers retrieved successfully
 */
router.get("/providers", getProviders);

/**
 * @swagger
 * /api/admin/providers:
 *   post:
 *     summary: Create a new payment provider
 *     tags: [Admin Providers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - code
 *               - type
 *             properties:
 *               name:
 *                 type: string
 *               code:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [deposit, withdrawal, both]
 *               api_endpoint:
 *                 type: string
 *               api_key:
 *                 type: string
 *               api_secret:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *               supported_currencies:
 *                 type: array
 *                 items:
 *                   type: string
 *               min_amount:
 *                 type: number
 *               max_amount:
 *                 type: number
 *               auto_approval:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Provider created successfully
 */
router.post("/providers", createProvider);

// =====================================================
// TRANSACTION MANAGEMENT ROUTES
// =====================================================

/**
 * @swagger
 * /api/admin/transactions:
 *   get:
 *     summary: Get all transactions for admin
 *     tags: [Admin Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [deposit, withdrawal, bet, win, bonus]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, completed, failed, cancelled]
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Transactions retrieved successfully
 */
router.get("/transactions", getTransactionsForAdmin);

/**
 * @swagger
 * /api/admin/transactions/{id}/approve:
 *   put:
 *     summary: Approve or reject a transaction
 *     tags: [Admin Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [completed, failed, cancelled]
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Transaction status updated successfully
 */
router.put("/transactions/:id/approve", approveTransaction);

// =====================================================
// SETTINGS ROUTES
// =====================================================

/**
 * @swagger
 * /api/admin/settings:
 *   get:
 *     summary: Get system settings
 *     tags: [Admin Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Settings retrieved successfully
 */
router.get("/settings", getSystemSettings);

/**
 * @swagger
 * /api/admin/settings:
 *   put:
 *     summary: Update system settings
 *     tags: [Admin Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               site_name:
 *                 type: string
 *               maintenance_mode:
 *                 type: boolean
 *               default_currency:
 *                 type: string
 *               min_deposit:
 *                 type: number
 *               max_deposit:
 *                 type: number
 *               auto_approval_limit:
 *                 type: number
 *               kyc_required:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Settings updated successfully
 */
router.put("/settings", updateSystemSettings);

// =====================================================
// ANALYTICS ROUTES
// =====================================================

/**
 * @swagger
 * /api/admin/analytics/revenue:
 *   get:
 *     summary: Get revenue analytics
 *     tags: [Admin Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Revenue analytics retrieved successfully
 */
router.get("/analytics/revenue", getRevenueAnalytics);

/**
 * @swagger
 * /api/admin/analytics/users:
 *   get:
 *     summary: Get user analytics
 *     tags: [Admin Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User analytics retrieved successfully
 */
router.get("/analytics/users", getUserAnalytics);

export default router; 