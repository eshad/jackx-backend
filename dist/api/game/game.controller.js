"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAvailableGames = void 0;
// Example endpoint: fetch available games
const getAvailableGames = (req, res) => {
    res.json({
        message: "List of available games",
        games: [
            { id: 1, name: "Blackjack" },
            { id: 2, name: "Roulette" },
            { id: 3, name: "Poker" },
        ],
    });
};
exports.getAvailableGames = getAvailableGames;
// You can add more handlers like:
// export const launchGame = ...
// export const getGameResult = ...
