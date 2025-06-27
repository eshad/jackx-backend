import pool from "../../db/postgres";
import bcrypt from "bcrypt";
import { LoginInput, RegisterInput } from "../../api/auth/auth.schema";
import { ErrorMessages, SuccessMessages } from "../../constants/messages";
import { Query } from "../../api/auth/auth.query";
import { LoginResponse } from "../../api/auth/types/auth";
import { JwtService } from '../jwt/jwt.service';
import { ApiError } from "../../utils/apiError";

const jwtService = new JwtService();

export const loginService = async (
  reqBody: LoginInput
): Promise<LoginResponse> => {
  try {
    const { username, password } = reqBody;

    const result = await pool.query(
      `
      SELECT 
        u.id, u.username, u.password, u.role_id, r.name AS role_name, r.description AS role_description
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.username = $1
      `,
      [username]
    );

    if (result.rows.length === 0) {
      throw new ApiError(ErrorMessages.INVALID_CREDENTIALS, 401);
    }

    const user = result.rows[0];

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new ApiError(ErrorMessages.INVALID_CREDENTIALS, 401);
    }

    // Sign JWT with user ID and role name
    const payload = {
      userId: user.id,
      username: user.username,
      role: user.role_name,
    };

    const accessToken = jwtService.signAccessToken(payload);
    const refreshToken = jwtService.signRefreshToken(payload);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      role: {
        id: user.role_id,
        username: user.username,
        name: user.role_name,
        description: user.role_description,
      },
    };
  } catch (err) {
    console.error(`[Login Error] ${err instanceof Error ? err.message : err}`);
    throw err;
  }
};

export const registerService = async (
  reqBody: RegisterInput
): Promise<string> => {
  try {
    const { username, email, password } = reqBody;

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      Query.REGISTER_USER,
      [username, email, hashedPassword]
    );

    if (result.rows.length === 0) {
      throw new ApiError('User creation failed', 500);
    }

    const userId = result.rows[0].id;

    // Create initial balance for the new user
    await pool.query(
      "INSERT INTO user_balances (user_id, balance) VALUES ($1, $2)",
      [userId, 0.00]
    );

    return SuccessMessages.REGISTER_SUCCESS;
  } catch (err) {
    console.error(`[Register Error] ${err instanceof Error ? err.message : err}`);
    throw err;
  }
};

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const refreshToken = req.body.refresh_token;
    if (!refreshToken) {
      throw new ApiError("Refresh token is required", 400);
    }

    // Validate and decode refresh token
    const decoded = jwtService.verifyRefreshToken(refreshToken);

    const payload = {
      userId: decoded.userId,
      username: decoded.username,
      role: decoded.role,
    };

    const newAccessToken = jwtService.signAccessToken(payload);
    const newRefreshToken = jwtService.signRefreshToken(payload);

    res.json({
      success: true,
      message: "Token refreshed successfully",
      token: {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
      },
    });
  } catch (err) {
    next(err);
  }
};