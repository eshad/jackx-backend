import { Request, Response, NextFunction } from "express";

export const GetHome = (_req: Request, res: Response, _next: NextFunction): void => {
  res.status(200).json({ message: "HOME , DATA!" });
};