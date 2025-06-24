import { Request, Response, NextFunction } from "express";
import { Role } from "../constants/roles";

export const authorize =
  (allowedRoles: Role[]) =>
  (req: Request, res: Response, next: NextFunction): Response | void => {
    const user = (req as any).user;

    if (!user || !user.role) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: No user found",
      });
    }

    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Insufficient permissions",
      });
    }

    next();
  };