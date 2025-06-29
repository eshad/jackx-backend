"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserAnalytics = exports.getRevenueAnalytics = exports.updateSystemSettings = exports.getSystemSettings = exports.approveTransaction = exports.getTransactions = exports.createProvider = exports.getProviders = exports.getDashboardStats = exports.updateUserBalance = exports.updateUserStatus = exports.getUsersForAdmin = exports.getGamesForAdmin = exports.deleteGame = exports.updateGame = exports.createGame = void 0;
const admin_service_1 = require("../../services/admin/admin.service");
// =====================================================
// GAME MANAGEMENT CONTROLLERS
// =====================================================
const createGame = async (req, res, next) => {
    try {
        const gameData = req.validated?.body;
        const game = await (0, admin_service_1.createGameService)(gameData);
        res.status(201).json({ success: true, data: game });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.createGame = createGame;
const updateGame = async (req, res, next) => {
    try {
        const gameId = parseInt(req.params.id);
        if (isNaN(gameId)) {
            res.status(400).json({ success: false, message: "Invalid game ID" });
            return;
        }
        const gameData = req.validated?.body;
        const game = await (0, admin_service_1.updateGameService)(gameId, gameData);
        res.status(200).json({ success: true, data: game });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.updateGame = updateGame;
const deleteGame = async (req, res, next) => {
    try {
        const gameId = parseInt(req.params.id);
        if (isNaN(gameId)) {
            res.status(400).json({ success: false, message: "Invalid game ID" });
            return;
        }
        const game = await (0, admin_service_1.deleteGameService)(gameId);
        res.status(200).json({ success: true, data: game });
    }
    catch (err) {
        next(err);
    }
};
exports.deleteGame = deleteGame;
const getGamesForAdmin = async (req, res, next) => {
    try {
        const filters = req.query;
        const games = await (0, admin_service_1.getGamesForAdminService)(filters);
        res.status(200).json({ success: true, data: games });
    }
    catch (err) {
        next(err);
    }
};
exports.getGamesForAdmin = getGamesForAdmin;
// =====================================================
// USER MANAGEMENT CONTROLLERS
// =====================================================
const getUsersForAdmin = async (req, res, next) => {
    try {
        const filters = req.query;
        const users = await (0, admin_service_1.getUsersForAdminService)(filters);
        res.status(200).json({ success: true, data: users });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getUsersForAdmin = getUsersForAdmin;
const updateUserStatus = async (req, res, next) => {
    try {
        const userId = parseInt(req.params.id);
        if (isNaN(userId)) {
            res.status(400).json({ success: false, message: "Invalid user ID" });
            return;
        }
        const statusData = req.validated?.body;
        const user = await (0, admin_service_1.updateUserStatusService)(userId, statusData);
        res.status(200).json({ success: true, data: user });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.updateUserStatus = updateUserStatus;
const updateUserBalance = async (req, res, next) => {
    try {
        const userId = parseInt(req.params.id);
        if (isNaN(userId)) {
            res.status(400).json({ success: false, message: "Invalid user ID" });
            return;
        }
        const balanceData = req.validated?.body;
        const result = await (0, admin_service_1.updateUserBalanceService)(userId, balanceData);
        res.status(200).json({ success: true, data: result });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.updateUserBalance = updateUserBalance;
// =====================================================
// DASHBOARD CONTROLLERS
// =====================================================
const getDashboardStats = async (req, res, next) => {
    try {
        const stats = await (0, admin_service_1.getDashboardStatsService)();
        res.status(200).json({ success: true, data: stats });
    }
    catch (err) {
        next(err);
    }
};
exports.getDashboardStats = getDashboardStats;
// =====================================================
// PROVIDER MANAGEMENT CONTROLLERS
// =====================================================
const getProviders = async (req, res, next) => {
    try {
        const providers = [];
        res.status(200).json({ success: true, data: providers });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getProviders = getProviders;
const createProvider = async (req, res, next) => {
    try {
        // This will be implemented in the service
        res.status(201).json({ success: true, message: "Provider created successfully" });
    }
    catch (err) {
        next(err);
    }
};
exports.createProvider = createProvider;
// =====================================================
// TRANSACTION MANAGEMENT CONTROLLERS
// =====================================================
const getTransactions = async (req, res) => {
    try {
        const filters = req.query;
        const transactions = await (0, admin_service_1.getTransactionsForAdminService)(filters);
        res.status(200).json({ success: true, data: transactions });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getTransactions = getTransactions;
const approveTransaction = async (req, res, next) => {
    try {
        const transactionId = parseInt(req.params.id);
        if (isNaN(transactionId)) {
            res.status(400).json({ success: false, message: "Invalid transaction ID" });
            return;
        }
        const { status, reason } = req.body;
        const approvalData = {
            transaction_id: transactionId,
            status,
            reason
        };
        const transaction = await (0, admin_service_1.approveTransactionService)(approvalData);
        res.status(200).json({ success: true, data: transaction });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.approveTransaction = approveTransaction;
// =====================================================
// SETTINGS CONTROLLERS
// =====================================================
const getSystemSettings = async (req, res, next) => {
    try {
        // This will be implemented in the service
        const settings = {};
        res.status(200).json({ success: true, data: settings });
    }
    catch (err) {
        next(err);
    }
};
exports.getSystemSettings = getSystemSettings;
const updateSystemSettings = async (req, res, next) => {
    try {
        // This will be implemented in the service
        res.status(200).json({ success: true, message: "Settings updated successfully" });
    }
    catch (err) {
        next(err);
    }
};
exports.updateSystemSettings = updateSystemSettings;
// =====================================================
// ANALYTICS CONTROLLERS
// =====================================================
const getRevenueAnalytics = async (req, res) => {
    try {
        const { start_date, end_date } = req.query;
        if (!start_date || !end_date) {
            res.status(400).json({ success: false, message: "Start date and end date are required" });
            return;
        }
        const analytics = await (0, admin_service_1.getRevenueAnalyticsService)(start_date, end_date);
        res.status(200).json({ success: true, data: analytics });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getRevenueAnalytics = getRevenueAnalytics;
const getUserAnalytics = async (req, res) => {
    try {
        const { start_date, end_date } = req.query;
        if (!start_date || !end_date) {
            res.status(400).json({ success: false, message: "Start date and end date are required" });
            return;
        }
        const analytics = await (0, admin_service_1.getUserAnalyticsService)(start_date, end_date);
        res.status(200).json({ success: true, data: analytics });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getUserAnalytics = getUserAnalytics;
