// src/middlewares/authenticate.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Config } from "../configs/config";

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ status: 401, message: "Missing or invalid token" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, Config.jwt.accessSecret) as any;
    (req as any).user = decoded;
    next();
  } catch (err) {
    console.error("JWT error:", err);
    res.status(401).json({ status: 401, message: "Invalid or expired token" });
  }
};