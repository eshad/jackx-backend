// /api/game.controller.ts
import { Request, Response } from "express";

// Example endpoint: fetch available games
export const getAvailableGames = (req: Request, res: Response) => {
  res.json({
    message: "List of available games",
    games: [
      { id: 1, name: "Blackjack" },
      { id: 2, name: "Roulette" },
      { id: 3, name: "Poker" },
    ],
  });
};

// You can add more handlers like:
// export const launchGame = ...
// export const getGameResult = ...