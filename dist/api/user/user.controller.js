"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserBalance = exports.getUserBettingHistory = exports.getUserTransactionHistory = exports.getUserRecentActivity = exports.getUserFavoriteGames = exports.getUserProfile = void 0;
const user_service_1 = require("../../services/user/user.service");
const getUserProfile = async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ success: false, message: "Unauthorized" });
            return;
        }
        const user = await (0, user_service_1.getUserWithBalanceService)(userId);
        res.status(200).json({ success: true, data: user });
    }
    catch (err) {
        next(err);
    }
};
exports.getUserProfile = getUserProfile;
const getUserFavoriteGames = async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ success: false, message: "Unauthorized" });
            return;
        }
        const favoriteGames = await (0, user_service_1.getUserFavoriteGamesService)(userId);
        res.status(200).json({ success: true, data: favoriteGames });
    }
    catch (err) {
        next(err);
    }
};
exports.getUserFavoriteGames = getUserFavoriteGames;
const getUserRecentActivity = async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        const limit = parseInt(req.query.limit) || 20;
        if (!userId) {
            res.status(401).json({ success: false, message: "Unauthorized" });
            return;
        }
        const activities = await (0, user_service_1.getUserRecentActivityService)(userId, limit);
        res.status(200).json({ success: true, data: activities });
    }
    catch (err) {
        next(err);
    }
};
exports.getUserRecentActivity = getUserRecentActivity;
const getUserTransactionHistory = async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        const limit = parseInt(req.query.limit) || 50;
        if (!userId) {
            res.status(401).json({ success: false, message: "Unauthorized" });
            return;
        }
        const transactions = await (0, user_service_1.getUserTransactionHistoryService)(userId, limit);
        res.status(200).json({ success: true, data: transactions });
    }
    catch (err) {
        next(err);
    }
};
exports.getUserTransactionHistory = getUserTransactionHistory;
const getUserBettingHistory = async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        const limit = parseInt(req.query.limit) || 50;
        if (!userId) {
            res.status(401).json({ success: false, message: "Unauthorized" });
            return;
        }
        const bets = await (0, user_service_1.getUserBettingHistoryService)(userId, limit);
        res.status(200).json({ success: true, data: bets });
    }
    catch (err) {
        next(err);
    }
};
exports.getUserBettingHistory = getUserBettingHistory;
// Keep the old function for backward compatibility
const getUserBalance = async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ success: false, message: "Unauthorized" });
            return;
        }
        const user = await (0, user_service_1.getUserWithBalanceService)(userId);
        res.status(200).json({ success: true, data: user });
    }
    catch (err) {
        next(err);
    }
};
exports.getUserBalance = getUserBalance;
