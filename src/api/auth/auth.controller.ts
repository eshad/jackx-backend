import { Request, Response, NextFunction } from "express";
import { loginService, registerService, refreshToken as refreshTokenService } from "../../services/auth/auth.service";
import { getUserRolesService } from "../../services/user/user.service";
import { LoginInput, RegisterInput } from "./auth.schema";
import { SuccessMessages } from "../../constants/messages";

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const reqBody = req.validated?.body as LoginInput;
    const response = await loginService(reqBody.username, reqBody.password, reqBody.role_id, req);
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

// ✅ This was missing
export const refreshToken = refreshTokenService;

export const getUserRoles = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { username } = req.query;
    
    if (!username || typeof username !== 'string') {
      res.status(400).json({ success: false, message: "Username is required" });
      return;
    }

    const roles = await getUserRolesService(username);
    res.json({ success: true, data: roles });
  } catch (err) {
    next(err);
  }
};