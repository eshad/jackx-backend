import { Request, Response, NextFunction } from "express";
import { loginService, registerService } from "../../services/auth/auth.service";
import { LoginInput, RegisterInput } from "./auth.schema";
import { SuccessMessages } from "../../constants/messages";

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const reqBody = req.validated?.body as LoginInput;
    const response = await loginService(reqBody);
    res.json({ success: true, message: SuccessMessages.LOGIN_SUCCESS , token: response });
  } catch (err) {
    next(err);
  }
};

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const reqBody = req.validated?.body as RegisterInput;
    const response = await registerService(reqBody);
    res.json({ success: true, message: response });
  } catch (err) {
    next(err);
  }
};