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
        u.id, u.username, u.password, r.id AS role_id, r.name AS role_name, r.description AS role_description
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      WHERE u.username = $1
      LIMIT 1
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

    // Start transaction
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Create user
      const userResult = await client.query(
        Query.REGISTER_USER,
        [username, email, hashedPassword]
      );

      if (userResult.rows.length === 0) {
        throw new ApiError('User creation failed', 500);
      }

      const userId = userResult.rows[0].id;

      // Assign default Player role
      const playerRoleResult = await client.query(
        "SELECT id FROM roles WHERE name = 'Player'"
      );

      if (playerRoleResult.rows.length === 0) {
        throw new ApiError('Default role not found', 500);
      }

      const playerRoleId = playerRoleResult.rows[0].id;

      await client.query(
        "INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)",
        [userId, playerRoleId]
      );

      // Create initial balance for the new user
      await client.query(
        "INSERT INTO user_balances (user_id, balance) VALUES ($1, $2)",
        [userId, 0.00]
      );

      // Create user profile
      await client.query(
        "INSERT INTO user_profiles (user_id) VALUES ($1)",
        [userId]
      );

      // Assign Bronze level
      const bronzeLevelResult = await client.query(
        "SELECT id FROM user_levels WHERE name = 'Bronze'"
      );

      if (bronzeLevelResult.rows.length > 0) {
        const bronzeLevelId = bronzeLevelResult.rows[0].id;
        await client.query(
          "INSERT INTO user_level_progress (user_id, level_id, current_points, total_points_earned) VALUES ($1, $2, $3, $4)",
          [userId, bronzeLevelId, 0, 0]
        );
      }

      await client.query('COMMIT');
      return SuccessMessages.REGISTER_SUCCESS;

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

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