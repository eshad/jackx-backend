"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const config_1 = require("../configs/config");
const apiError_1 = require("../utils/apiError");
const messages_1 = require("../constants/messages");
const { host, user, password, database, //db name
port } = config_1.Config.db;
if (!host || !user || !password || !database || !port) {
    throw new apiError_1.ApiError(messages_1.ErrorMessages.POSTGRES_CONNECTION_ERROR, 500);
}
const pool = new pg_1.Pool({
    host, user, password, database, port: Number(port)
});
exports.default = pool;
