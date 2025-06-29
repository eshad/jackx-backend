import { Request, Response, NextFunction } from "express";
import { 
  getUserWithBalanceService, 
  getUserFavoriteGamesService,
  getUserRecentActivityService,
  getUserTransactionHistoryService,
  getUserBettingHistoryService,
  getUserActivitySummaryService
} from "../../services/user/user.service";

export const getUserProfile = async (
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

    const user = await getUserWithBalanceService(userId);
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  } 
};

export const getUserFavoriteGames = async (
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

    const favoriteGames = await getUserFavoriteGamesService(userId);
    res.status(200).json({ success: true, data: favoriteGames });
  } catch (err) {
    next(err);
  } 
};

export const getUserRecentActivity = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    const limit = parseInt(req.query.limit as string) || 20;
    
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const activities = await getUserRecentActivityService(userId, limit);
    res.status(200).json({ success: true, data: activities });
  } catch (err) {
    next(err);
  } 
};

export const getUserTransactionHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    const limit = parseInt(req.query.limit as string) || 50;
    
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const transactions = await getUserTransactionHistoryService(userId, limit);
    res.status(200).json({ success: true, data: transactions });
  } catch (err) {
    next(err);
  } 
};

export const getUserBettingHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    const limit = parseInt(req.query.limit as string) || 50;
    
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const bets = await getUserBettingHistoryService(userId, limit);
    res.status(200).json({ success: true, data: bets });
  } catch (err) {
    next(err);
  } 
};

// Get comprehensive user activity summary
export const getUserActivitySummary = async (
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

    const summary = await getUserActivitySummaryService(userId);
    res.status(200).json({ success: true, data: summary });
  } catch (err) {
    next(err);
  }
};

// Keep the old function for backward compatibility
export const getUserBalance = async (
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

    const user = await getUserWithBalanceService(userId);
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  } 
};