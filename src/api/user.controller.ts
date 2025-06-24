import { Request, Response, NextFunction } from "express";

export const getUser = (_req: Request, res: Response, _next: NextFunction): void => {
  res.status(200).json({ message: "Hello, World!" });
};