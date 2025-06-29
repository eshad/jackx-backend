import pool from "../../db/postgres";
import bcrypt from "bcrypt";
import { LoginInput, RegisterInput } from "../../api/auth/auth.schema";
import { ErrorMessages, SuccessMessages } from "../../constants/messages";
import { Query } from "../../api/auth/auth.query";
import { LoginResponse } from "../../api/auth/types/auth";
import { JwtService } from '../jwt/jwt.service';
import { ApiError } from "../../utils/apiError";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Config } from "../../configs/config";
import { getUserByUsernameService, getUserRolesService } from "../user/user.service";
import { logUserActivity } from "../user/user-activity.service";

const jwtService = new JwtService();

export const loginService = async (
  username: string,
  password: string,
  roleId?: number,
  req?: Request
): Promise<LoginResponse> => {
  const user = await getUserByUsernameService(username);
  
  if (!user) {
    throw new ApiError(ErrorMessages.INVALID_CREDENTIALS, 401);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new ApiError(ErrorMessages.INVALID_CREDENTIALS, 401);
  }

  // Get user roles
  const userRolesResult = await pool.query(
    "SELECT r.id, r.name FROM user_roles ur JOIN roles r ON ur.role_id = r.id WHERE ur.user_id = $1",
    [user.id]
  );
  
  const userRoles = userRolesResult.rows;
  
  if (userRoles.length === 0) {
    throw new ApiError('User has no assigned roles', 401);
  }
  
  // Determine which role to use
  let selectedRole = userRoles.find(role => role.name === "Player"); // Default to player
  
  if (roleId) {
    const requestedRole = userRoles.find(role => role.id === roleId);
    if (requestedRole) {
      selectedRole = requestedRole;
    }
  }

  if (!selectedRole) {
    throw new Error("No valid role found for user");
  }

  const payload = { 
    userId: user.id, 
    username: user.username,
    role: selectedRole.name,
    roleId: selectedRole.id
  };

  const accessToken = jwtService.signAccessToken(payload);
  const refreshToken = jwtService.signRefreshToken(payload);

  // Log user login activity
  await logUserActivity({
    userId: user.id,
    action: "login",
    category: "auth",
    description: "User logged in",
    ipAddress: req?.ip || null,
    userAgent: req?.headers["user-agent"] || null,
  });

  return {
    access_token: accessToken,
    refresh_token: refreshToken
  };
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

      // Log user registration activity
      await client.query(
        `
        INSERT INTO user_activity_logs 
        (user_id, action, category, description, metadata)
        VALUES ($1, 'register', 'auth', 'User registered', $2)
        `,
        [
          userId,
          JSON.stringify({ 
            username: username, 
            email: email,
            registration_method: 'email'
          })
        ]
      );

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

export const refreshTokenService = async (
  refreshToken: string
): Promise<LoginResponse> => {
  try {
    const decoded = jwtService.verifyRefreshToken(refreshToken);
    
    const user = await getUserByUsernameService(decoded.username);
    if (!user) {
      throw new Error("User not found");
    }

    const payload = { 
      userId: user.id, 
      username: user.username,
      role: decoded.role,
      roleId: decoded.roleId
    };

    const accessToken = jwtService.signAccessToken(payload);
    const newRefreshToken = jwtService.signRefreshToken(payload);

    return {
      access_token: accessToken,
      refresh_token: newRefreshToken
    };
  } catch (error) {
    throw new Error("Invalid refresh token");
  }
};

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const refreshToken = req.body?.refresh_token;
    
    if (!refreshToken) {
      res.status(400).json({
        success: false,
        message: "Refresh token is required"
      });
      return;
    }

    const tokens = await refreshTokenService(refreshToken);
    
    res.json({
      success: true,
      message: "Tokens refreshed successfully",
      data: tokens
    });
  } catch (error: any) {
    res.status(401).json({
      success: false,
      message: error.message
    });
  }
};