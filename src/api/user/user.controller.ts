import { Request, Response, NextFunction } from "express";
import { getUserWithBalanceService } from "../../services/user/user.service";

export const getUserBalance = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {

    const userId = (req as any).user?.userId;
    // console.log("UserID: ",userId)
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