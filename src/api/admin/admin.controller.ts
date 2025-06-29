import { Request, Response, NextFunction } from "express";
import {
  createGameService,
  updateGameService,
  deleteGameService,
  getGamesForAdminService,
  getUsersForAdminService,
  updateUserStatusService,
  updateUserBalanceService,
  approveTransactionService,
  getDashboardStatsService,
  getSystemSettingsService,
  updateSystemSettingsService,
  getTransactionsForAdminService,
  getRevenueAnalyticsService,
  getUserAnalyticsService
} from "../../services/admin/admin.service";
import {
  CreateGameInputType,
  UpdateGameInputType,
  UserFiltersInputType,
  UpdateUserStatusInputType,
  UpdateUserBalanceInputType,
  ApproveTransactionInputType
} from "./admin.schema";

// =====================================================
// GAME MANAGEMENT CONTROLLERS
// =====================================================

export const createGame = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const gameData = req.validated?.body as CreateGameInputType;
    const game = await createGameService(gameData);
    res.status(201).json({ success: true, data: game });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateGame = async (
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

    const gameData = req.validated?.body as UpdateGameInputType;
    const game = await updateGameService(gameId, gameData);
    res.status(200).json({ success: true, data: game });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteGame = async (
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

    const game = await deleteGameService(gameId);
    res.status(200).json({ success: true, data: game });
  } catch (err) {
    next(err);
  }
};

export const getGamesForAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const filters = req.query as any;
    const games = await getGamesForAdminService(filters);
    res.status(200).json({ success: true, data: games });
  } catch (err) {
    next(err);
  }
};

// =====================================================
// USER MANAGEMENT CONTROLLERS
// =====================================================

export const getUsersForAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const filters: UserFiltersInputType = req.query as any;
    const users = await getUsersForAdminService(filters);
    res.status(200).json({ success: true, data: users });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateUserStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      res.status(400).json({ success: false, message: "Invalid user ID" });
      return;
    }

    const statusData = req.validated?.body as UpdateUserStatusInputType;
    const user = await updateUserStatusService(userId, statusData);
    res.status(200).json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateUserBalance = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      res.status(400).json({ success: false, message: "Invalid user ID" });
      return;
    }

    const balanceData = req.validated?.body as UpdateUserBalanceInputType;
    const result = await updateUserBalanceService(userId, balanceData);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// =====================================================
// DASHBOARD CONTROLLERS
// =====================================================

export const getDashboardStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const stats = await getDashboardStatsService();
    res.status(200).json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
};

// =====================================================
// PROVIDER MANAGEMENT CONTROLLERS
// =====================================================

export const getProviders = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const providers: any[] = [];
    res.status(200).json({ success: true, data: providers });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createProvider = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // This will be implemented in the service
    res.status(201).json({ success: true, message: "Provider created successfully" });
  } catch (err) {
    next(err);
  }
};

// =====================================================
// TRANSACTION MANAGEMENT CONTROLLERS
// =====================================================

export const getTransactions = async (req: Request, res: Response) => {
  try {
    const filters = req.query as any;
    const transactions = await getTransactionsForAdminService(filters);
    res.status(200).json({ success: true, data: transactions });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const approveTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const transactionId = parseInt(req.params.id);
    if (isNaN(transactionId)) {
      res.status(400).json({ success: false, message: "Invalid transaction ID" });
      return;
    }

    const { status, reason } = req.body;
    const approvalData: ApproveTransactionInputType = {
      transaction_id: transactionId,
      status,
      reason
    };
    const transaction = await approveTransactionService(approvalData);
    res.status(200).json({ success: true, data: transaction });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// =====================================================
// SETTINGS CONTROLLERS
// =====================================================

export const getSystemSettings = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // This will be implemented in the service
    const settings = {};
    res.status(200).json({ success: true, data: settings });
  } catch (err) {
    next(err);
  }
};

export const updateSystemSettings = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // This will be implemented in the service
    res.status(200).json({ success: true, message: "Settings updated successfully" });
  } catch (err) {
    next(err);
  }
};

// =====================================================
// ANALYTICS CONTROLLERS
// =====================================================

export const getRevenueAnalytics = async (req: Request, res: Response) => {
  try {
    const { start_date, end_date } = req.query;
    
    if (!start_date || !end_date) {
      res.status(400).json({ success: false, message: "Start date and end date are required" });
      return;
    }
    
    const analytics = await getRevenueAnalyticsService(start_date as string, end_date as string);
    res.status(200).json({ success: true, data: analytics });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserAnalytics = async (req: Request, res: Response) => {
  try {
    const { start_date, end_date } = req.query;
    
    if (!start_date || !end_date) {
      res.status(400).json({ success: false, message: "Start date and end date are required" });
      return;
    }
    
    const analytics = await getUserAnalyticsService(start_date as string, end_date as string);
    res.status(200).json({ success: true, data: analytics });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}; 