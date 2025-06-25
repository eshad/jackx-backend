"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuccessMessages = exports.ErrorMessages = void 0;
exports.ErrorMessages = {
    USER_NOT_FOUND: "User not found.",
    INVALID_CREDENTIALS: "Invalid email or password.",
    SERVER_ERROR: "Something went wrong. Please try again.",
    INVALID_EMAIL: "Invalid email format",
    INVALID_USERNAME: "Username minimum 5 characters",
    INVALID_PASSWORD: "Password minimum 8 characters ",
    EXPIRED_ACCESS_TOKEN: "Access token expired",
    INVALID_ACCESS_TOKEN: "Invalid access token",
    EXPIRED_REFRESH_TOKEN: "Refresh token expired",
    INVALID_REFRESH_TOKEN: "Invalid refresh token",
    MONGO_CONNECTION_ERROR: "MONGO_URI is not defined in environment variables.",
    POSTGRES_CONNECTION_ERROR: "Missing required database env vars",
};
exports.SuccessMessages = {
    USER_CREATED: "User created successfully.",
    REGISTER_SUCCESS: "Registered Successfully",
    LOGIN_SUCCESS: "Login Successfully"
};
