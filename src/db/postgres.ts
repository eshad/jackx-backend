import { Pool } from 'pg';
import { Config } from '../configs/config';
import { ApiError } from '../utils/apiError';
import { ErrorMessages } from '../constants/messages';

const {
  host,
  user,
  password,
  database, //db name
  port
} = Config.db;

if (!host || !user || !password || !database || !port) {
  throw new ApiError(ErrorMessages.POSTGRES_CONNECTION_ERROR, 500);   
}

const pool = new Pool({
  host, user, password, database, port: Number(port)
});

export default pool;