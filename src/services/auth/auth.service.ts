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
    let username = reqBody.username
    const result = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );
    
    if (result.rows.length === 0) {
      throw new ApiError(ErrorMessages.INVALID_CREDENTIALS, 401);
    }

    let password = reqBody.password
    const user = result.rows[0];

    // Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new ApiError(ErrorMessages.INVALID_CREDENTIALS, 401);
    }

    // Sign JWT
    const payload = { userId: user.id, username: user.username };
    const accessToken = jwtService.signAccessToken(payload);
    const refreshToken = jwtService.signRefreshToken(payload);

    return {
      access_token: accessToken,
      refresh_token: refreshToken
    };
  } catch (err) {
    //TODO: winston, pino
    console.error(`[Login Error] ${err instanceof Error ? err.message : err}`);
    throw err;
  }
};

export const registerService = async (
  reqBody: RegisterInput
): Promise<string> => {
  try {
    let username = reqBody.username
    let email = reqBody.email
    let password = reqBody.password

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      Query.REGISTER_USER,
      [username, email, hashedPassword]
    );

    if (result.rowCount === 0) {
      //Unlikely happend because Active is default created data in DB
      throw new ApiError('Status "Active" not found', 404);
    } else {
      return SuccessMessages.REGISTER_SUCCESS;
    }
  } catch (err) {
    console.error(`[Register Error] ${err instanceof Error ? err.message : err}`);
    throw err;
  }
};