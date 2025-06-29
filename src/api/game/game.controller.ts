// /api/game.controller.ts
import { Request, Response, NextFunction } from "express";
import {
  getAvailableGamesService,
  getGameByIdService,
  getGameCategoriesService,
  getGameProvidersService,
  getFeaturedGamesService,
  getNewGamesService,
  getHotGamesService,
  getPopularGamesService,
  getGameStatisticsService,
  toggleGameFavoriteService,
  recordGamePlayService,
  placeBetService,
  processBetResultService,
  getGamePlayInfoService
} from "../../services/game/game.service";
import {
  PlaceBetInput,
  ProcessBetResultInput,
  RecordGamePlayInput,
  ToggleGameFavoriteInput,
  GameFiltersInput,
  PlayGameInput
} from "./game.schema";

// Get all available games with filtering
export const getAvailableGames = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const filters: GameFiltersInput = req.query as any;
    const games = await getAvailableGamesService(filters);
    res.status(200).json({ success: true, data: games });
  } catch (err) {
    next(err);
  }
};

// Get game by ID
export const getGameById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const gameId = parseInt(req.params.id);
    if (isNaN(gameId)) {
      res.status(400).json({ success: false, message: "Invalid game ID" });
      return;
    }

    const game = await getGameByIdService(gameId);
    res.status(200).json({ success: true, data: game });
  } catch (err) {
    next(err);
  }
};

// Get game categories
export const getGameCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const categories = await getGameCategoriesService();
    res.status(200).json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
};

// Get game providers
export const getGameProviders = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const providers = await getGameProvidersService();
    res.status(200).json({ success: true, data: providers });
  } catch (err) {
    next(err);
  }
};

// Get featured games
export const getFeaturedGames = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const games = await getFeaturedGamesService(limit);
    res.status(200).json({ success: true, data: games });
  } catch (err) {
    next(err);
  }
};

// Get new games
export const getNewGames = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const games = await getNewGamesService(limit);
    res.status(200).json({ success: true, data: games });
  } catch (err) {
    next(err);
  }
};

// Get hot games
export const getHotGames = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const games = await getHotGamesService(limit);
    res.status(200).json({ success: true, data: games });
  } catch (err) {
    next(err);
  }
};

// Get popular games
export const getPopularGames = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const games = await getPopularGamesService(limit);
    res.status(200).json({ success: true, data: games });
  } catch (err) {
    next(err);
  }
};

// Get game statistics
export const getGameStatistics = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const gameId = parseInt(req.params.id);
    if (isNaN(gameId)) {
      res.status(400).json({ success: false, message: "Invalid game ID" });
      return;
    }

    const statistics = await getGameStatisticsService(gameId);
    res.status(200).json({ success: true, data: statistics });
  } catch (err) {
    next(err);
  }
};

// Toggle game favorite status
export const toggleGameFavorite = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const { game_id } = req.validated?.body as ToggleGameFavoriteInput;
    const result = await toggleGameFavoriteService(userId, game_id);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

// Record game play
export const recordGamePlay = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const { game_id, play_time_seconds } = req.validated?.body as RecordGamePlayInput;
    await recordGamePlayService(userId, game_id, play_time_seconds || 0);
    res.status(200).json({ success: true, message: "Game play recorded successfully" });
  } catch (err) {
    next(err);
  }
};

// Place a bet
export const placeBet = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const { game_id, bet_amount, game_data } = req.validated?.body as PlaceBetInput;
    const result = await placeBetService(userId, game_id, bet_amount, game_data);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

// Process bet result (admin only)
export const processBetResult = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { bet_id, outcome, win_amount, game_result } = req.validated?.body as ProcessBetResultInput;
    const result = await processBetResultService(bet_id, outcome, win_amount || 0, game_result);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

// Keep the old function for backward compatibility
export const getAvailableGamesLegacy = (req: Request, res: Response) => {
  res.json({
    message: "List of available games",
    games: [
      { id: 1, name: "Blackjack" },
      { id: 2, name: "Roulette" },
      { id: 3, name: "Poker" },
    ],
  });
};

// Play game (get play URL and info from provider)
export const playGame = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }
    const { game_id } = req.validated?.body as PlayGameInput;
    if (!game_id && game_id !== 0) {
      res.status(400).json({ success: false, message: "game_id is required" });
      return;
    }
    const playInfo = await getGamePlayInfoService(game_id, userId);
    res.status(200).json({ success: true, data: playInfo });
  } catch (err) {
    next(err);
  }
};