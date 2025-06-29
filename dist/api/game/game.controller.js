"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAvailableGamesLegacy = exports.processBetResult = exports.placeBet = exports.recordGamePlay = exports.toggleGameFavorite = exports.getGameStatistics = exports.getPopularGames = exports.getHotGames = exports.getNewGames = exports.getFeaturedGames = exports.getGameProviders = exports.getGameCategories = exports.getGameById = exports.getAvailableGames = void 0;
const game_service_1 = require("../../services/game/game.service");
// Get all available games with filtering
const getAvailableGames = async (req, res, next) => {
    try {
        const filters = req.query;
        const games = await (0, game_service_1.getAvailableGamesService)(filters);
        res.status(200).json({ success: true, data: games });
    }
    catch (err) {
        next(err);
    }
};
exports.getAvailableGames = getAvailableGames;
// Get game by ID
const getGameById = async (req, res, next) => {
    try {
        const gameId = parseInt(req.params.id);
        if (isNaN(gameId)) {
            res.status(400).json({ success: false, message: "Invalid game ID" });
            return;
        }
        const game = await (0, game_service_1.getGameByIdService)(gameId);
        res.status(200).json({ success: true, data: game });
    }
    catch (err) {
        next(err);
    }
};
exports.getGameById = getGameById;
// Get game categories
const getGameCategories = async (req, res, next) => {
    try {
        const categories = await (0, game_service_1.getGameCategoriesService)();
        res.status(200).json({ success: true, data: categories });
    }
    catch (err) {
        next(err);
    }
};
exports.getGameCategories = getGameCategories;
// Get game providers
const getGameProviders = async (req, res, next) => {
    try {
        const providers = await (0, game_service_1.getGameProvidersService)();
        res.status(200).json({ success: true, data: providers });
    }
    catch (err) {
        next(err);
    }
};
exports.getGameProviders = getGameProviders;
// Get featured games
const getFeaturedGames = async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const games = await (0, game_service_1.getFeaturedGamesService)(limit);
        res.status(200).json({ success: true, data: games });
    }
    catch (err) {
        next(err);
    }
};
exports.getFeaturedGames = getFeaturedGames;
// Get new games
const getNewGames = async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const games = await (0, game_service_1.getNewGamesService)(limit);
        res.status(200).json({ success: true, data: games });
    }
    catch (err) {
        next(err);
    }
};
exports.getNewGames = getNewGames;
// Get hot games
const getHotGames = async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const games = await (0, game_service_1.getHotGamesService)(limit);
        res.status(200).json({ success: true, data: games });
    }
    catch (err) {
        next(err);
    }
};
exports.getHotGames = getHotGames;
// Get popular games
const getPopularGames = async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const games = await (0, game_service_1.getPopularGamesService)(limit);
        res.status(200).json({ success: true, data: games });
    }
    catch (err) {
        next(err);
    }
};
exports.getPopularGames = getPopularGames;
// Get game statistics
const getGameStatistics = async (req, res, next) => {
    try {
        const gameId = parseInt(req.params.id);
        if (isNaN(gameId)) {
            res.status(400).json({ success: false, message: "Invalid game ID" });
            return;
        }
        const statistics = await (0, game_service_1.getGameStatisticsService)(gameId);
        res.status(200).json({ success: true, data: statistics });
    }
    catch (err) {
        next(err);
    }
};
exports.getGameStatistics = getGameStatistics;
// Toggle game favorite status
const toggleGameFavorite = async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ success: false, message: "Unauthorized" });
            return;
        }
        const { game_id } = req.validated?.body;
        const result = await (0, game_service_1.toggleGameFavoriteService)(userId, game_id);
        res.status(200).json({ success: true, data: result });
    }
    catch (err) {
        next(err);
    }
};
exports.toggleGameFavorite = toggleGameFavorite;
// Record game play
const recordGamePlay = async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ success: false, message: "Unauthorized" });
            return;
        }
        const { game_id, play_time_seconds } = req.validated?.body;
        await (0, game_service_1.recordGamePlayService)(userId, game_id, play_time_seconds || 0);
        res.status(200).json({ success: true, message: "Game play recorded successfully" });
    }
    catch (err) {
        next(err);
    }
};
exports.recordGamePlay = recordGamePlay;
// Place a bet
const placeBet = async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ success: false, message: "Unauthorized" });
            return;
        }
        const { game_id, bet_amount, game_data } = req.validated?.body;
        const result = await (0, game_service_1.placeBetService)(userId, game_id, bet_amount, game_data);
        res.status(200).json({ success: true, data: result });
    }
    catch (err) {
        next(err);
    }
};
exports.placeBet = placeBet;
// Process bet result (admin only)
const processBetResult = async (req, res, next) => {
    try {
        const { bet_id, outcome, win_amount, game_result } = req.validated?.body;
        const result = await (0, game_service_1.processBetResultService)(bet_id, outcome, win_amount || 0, game_result);
        res.status(200).json({ success: true, data: result });
    }
    catch (err) {
        next(err);
    }
};
exports.processBetResult = processBetResult;
// Keep the old function for backward compatibility
const getAvailableGamesLegacy = (req, res) => {
    res.json({
        message: "List of available games",
        games: [
            { id: 1, name: "Blackjack" },
            { id: 2, name: "Roulette" },
            { id: 3, name: "Poker" },
        ],
    });
};
exports.getAvailableGamesLegacy = getAvailableGamesLegacy;
