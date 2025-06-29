import pool from "../../db/postgres";
import {
  CreateGameInputType,
  UpdateGameInputType,
  GameFiltersInputType,
  UserFiltersInputType,
  UpdateUserStatusInputType,
  UpdateUserBalanceInputType,
  CreatePaymentGatewayInputType,
  UpdatePaymentGatewayInputType,
  TransactionFiltersInputType,
  ApproveTransactionInputType,
  UpdateSystemSettingsInputType
} from "../../api/admin/admin.schema";

// =====================================================
// GAME MANAGEMENT SERVICES
// =====================================================

export const createGameService = async (gameData: CreateGameInputType) => {
  const query = `
    INSERT INTO games (name, provider, category, subcategory, image_url, 
      game_code, rtp_percentage, volatility, min_bet, max_bet,
      is_featured, is_new, is_hot, is_active)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    RETURNING *
  `;
  
  const values = [
    gameData.name, gameData.provider, gameData.category, gameData.subcategory,
    gameData.image_url, gameData.game_code, gameData.rtp_percentage,
    gameData.volatility, gameData.min_bet, gameData.max_bet,
    gameData.is_featured || false, gameData.is_new || false,
    gameData.is_hot || false, gameData.is_active !== false
  ];
  
  const result = await pool.query(query, values);
  return result.rows[0];
};

export const updateGameService = async (gameId: number, gameData: UpdateGameInputType) => {
  const fields: string[] = [];
  const values: any[] = [];
  let paramCount = 1;
  
  Object.entries(gameData).forEach(([key, value]) => {
    if (value !== undefined) {
      fields.push(`${key} = $${paramCount}`);
      values.push(value);
      paramCount++;
    }
  });
  
  if (fields.length === 0) {
    throw new Error("No valid fields to update");
  }
  
  values.push(gameId);
  const query = `
    UPDATE games 
    SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP
    WHERE id = $${paramCount}
    RETURNING *
  `;
  
  const result = await pool.query(query, values);
  return result.rows[0];
};

export const deleteGameService = async (gameId: number) => {
  const query = "DELETE FROM games WHERE id = $1 RETURNING *";
  const result = await pool.query(query, [gameId]);
  return result.rows[0];
};

export const getGamesForAdminService = async (filters: any = {}) => {
  let query = `
    SELECT g.*, 
           COUNT(DISTINCT b.id) as total_bets,
           SUM(b.bet_amount) as total_wagered,
           SUM(b.win_amount) as total_won
    FROM games g
    LEFT JOIN bets b ON g.id = b.game_id
  `;
  
  const conditions = [];
  const values = [];
  let paramCount = 1;
  
  if (filters.provider) {
    conditions.push(`g.provider = $${paramCount}`);
    values.push(filters.provider);
    paramCount++;
  }
  
  if (filters.category) {
    conditions.push(`g.category = $${paramCount}`);
    values.push(filters.category);
    paramCount++;
  }
  
  if (filters.is_active !== undefined) {
    conditions.push(`g.is_active = $${paramCount}`);
    values.push(filters.is_active);
    paramCount++;
  }
  
  if (filters.search) {
    conditions.push(`(g.name ILIKE $${paramCount} OR g.provider ILIKE $${paramCount})`);
    values.push(`%${filters.search}%`);
    paramCount++;
  }
  
  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(" AND ")}`;
  }
  
  query += ` GROUP BY g.id ORDER BY g.created_at DESC`;
  
  if (filters.limit) {
    query += ` LIMIT $${paramCount}`;
    values.push(filters.limit);
  }
  
  const result = await pool.query(query, values);
  return result.rows;
};

// =====================================================
// USER MANAGEMENT SERVICES
// =====================================================

export const getUsersForAdminService = async (filters: UserFiltersInputType) => {
  let query = `
    SELECT u.*, up.*, s.name as status_name,
           COUNT(DISTINCT b.id) as total_bets,
           SUM(b.bet_amount) as total_wagered,
           SUM(b.win_amount) as total_won,
           ub.balance, ub.total_deposited, ub.total_withdrawn
    FROM users u
    LEFT JOIN user_profiles up ON u.id = up.user_id
    LEFT JOIN statuses s ON u.status_id = s.id
    LEFT JOIN bets b ON u.id = b.user_id
    LEFT JOIN user_balances ub ON u.id = ub.user_id
  `;
  
  const conditions = [];
  const values = [];
  let paramCount = 1;
  
  if (filters.status) {
    conditions.push(`s.name = $${paramCount}`);
    values.push(filters.status);
    paramCount++;
  }
  
  if (filters.verification_level !== undefined) {
    conditions.push(`up.verification_level = $${paramCount}`);
    values.push(filters.verification_level);
    paramCount++;
  }
  
  if (filters.search) {
    conditions.push(`(u.username ILIKE $${paramCount} OR u.email ILIKE $${paramCount})`);
    values.push(`%${filters.search}%`);
    paramCount++;
  }
  
  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(" AND ")}`;
  }
  
  query += ` GROUP BY u.id, up.id, s.name, ub.balance, ub.total_deposited, ub.total_withdrawn ORDER BY u.created_at DESC`;
  
  if (filters.limit) {
    query += ` LIMIT $${paramCount}`;
    values.push(filters.limit);
  }
  
  const result = await pool.query(query, values);
  return result.rows;
};

export const updateUserStatusService = async (userId: number, statusData: UpdateUserStatusInputType) => {
  const fields: string[] = [];
  const values: any[] = [];
  let paramCount = 1;
  
  const statusQuery = "SELECT id FROM statuses WHERE name = $1";
  const statusResult = await pool.query(statusQuery, [statusData.status]);
  
  if (statusResult.rows.length === 0) {
    throw new Error("Invalid status");
  }
  
  fields.push(`status_id = $${paramCount}`);
  values.push(statusResult.rows[0].id);
  paramCount++;
  
  values.push(userId);
  const query = `
    UPDATE users 
    SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP
    WHERE id = $${paramCount}
    RETURNING *
  `;
  
  const result = await pool.query(query, values);
  
  // Log admin status update activity
  await pool.query(
    `
    INSERT INTO user_activity_logs 
    (user_id, action, category, description, metadata)
    VALUES ($1, 'admin_status_update', 'account', $2, $3)
    `,
    [
      userId,
      `Status updated to: ${statusData.status}`,
      JSON.stringify({ 
        new_status: statusData.status, 
        reason: statusData.reason || 'No reason provided'
      })
    ]
  );
  
  return result.rows[0];
};

export const updateUserBalanceService = async (userId: number, balanceData: UpdateUserBalanceInputType) => {
  const fields: string[] = [];
  const values: any[] = [];
  let paramCount = 1;
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Create transaction record
    const transactionQuery = `
      INSERT INTO transactions (user_id, type, amount, status, description)
      VALUES ($1, $2, $3, 'completed', $4)
      RETURNING id
    `;
    const transactionResult = await client.query(transactionQuery, [
      userId, balanceData.type, balanceData.amount, balanceData.reason || 'Admin adjustment'
    ]);
    
    // Update user balance
    fields.push(`balance = balance + $${paramCount}`);
    values.push(balanceData.type === 'withdrawal' ? -balanceData.amount : balanceData.amount);
    paramCount++;
    
    fields.push(`total_deposited = CASE WHEN $${paramCount} = 'deposit' THEN total_deposited + $${paramCount} ELSE total_deposited END`);
    values.push(balanceData.type);
    paramCount++;
    
    fields.push(`total_withdrawn = CASE WHEN $${paramCount} = 'withdrawal' THEN total_withdrawn + $${paramCount} ELSE total_withdrawn END`);
    values.push(balanceData.type);
    paramCount++;
    
    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(new Date());
    paramCount++;
    
    const balanceQuery = `
      UPDATE user_balances 
      SET ${fields.join(", ")}
      WHERE user_id = $${paramCount}
      RETURNING *
    `;
    
    const balanceResult = await client.query(balanceQuery, values);
    
    // Log admin balance adjustment activity
    await client.query(
      `
      INSERT INTO user_activity_logs 
      (user_id, action, category, description, metadata)
      VALUES ($1, 'admin_balance_adjustment', 'financial', $2, $3)
      `,
      [
        userId,
        `Admin ${balanceData.type} adjustment: ${balanceData.amount}`,
        JSON.stringify({ 
          type: balanceData.type, 
          amount: balanceData.amount, 
          reason: balanceData.reason,
          transaction_id: transactionResult.rows[0].id
        })
      ]
    );
    
    await client.query('COMMIT');
    
    return {
      transaction: transactionResult.rows[0],
      balance: balanceResult.rows[0]
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// =====================================================
// PAYMENT GATEWAY SERVICES
// =====================================================

export const createPaymentGatewayService = async (gatewayData: CreatePaymentGatewayInputType) => {
  const query = `
    INSERT INTO payment_gateways (
      name, code, type, api_endpoint, api_key, api_secret,
      is_active, supported_currencies, min_amount, max_amount, auto_approval
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING *
  `;
  
  const values = [
    gatewayData.name, gatewayData.code, gatewayData.type,
    gatewayData.api_endpoint, gatewayData.api_key, gatewayData.api_secret,
    gatewayData.is_active !== false, gatewayData.supported_currencies,
    gatewayData.min_amount, gatewayData.max_amount, gatewayData.auto_approval || false
  ];
  
  const result = await pool.query(query, values);
  return result.rows[0];
};

export const updatePaymentGatewayService = async (gatewayId: number, gatewayData: UpdatePaymentGatewayInputType) => {
  const fields: string[] = [];
  const values: any[] = [];
  let paramCount = 1;
  
  Object.entries(gatewayData).forEach(([key, value]) => {
    if (value !== undefined) {
      fields.push(`${key} = $${paramCount}`);
      values.push(value);
      paramCount++;
    }
  });
  
  if (fields.length === 0) {
    throw new Error("No fields to update");
  }
  
  values.push(gatewayId);
  const query = `
    UPDATE payment_gateways 
    SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP
    WHERE id = $${paramCount}
    RETURNING *
  `;
  
  const result = await pool.query(query, values);
  return result.rows[0];
};

export const getPaymentGatewaysService = async (filters: any = {}) => {
  let query = "SELECT * FROM payment_gateways";
  const conditions = [];
  const values = [];
  let paramCount = 1;
  
  if (filters.type) {
    conditions.push(`type = $${paramCount}`);
    values.push(filters.type);
    paramCount++;
  }
  
  if (filters.is_active !== undefined) {
    conditions.push(`is_active = $${paramCount}`);
    values.push(filters.is_active);
    paramCount++;
  }
  
  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(" AND ")}`;
  }
  
  query += " ORDER BY created_at DESC";
  
  const result = await pool.query(query, values);
  return result.rows;
};

// =====================================================
// TRANSACTION MANAGEMENT SERVICES
// =====================================================

export const getTransactionsForAdminService = async (filters: TransactionFiltersInputType) => {
  let query = `
    SELECT t.*, u.username, u.email, up.first_name, up.last_name
    FROM transactions t
    LEFT JOIN users u ON t.user_id = u.id
    LEFT JOIN user_profiles up ON u.id = up.user_id
  `;
  
  const conditions = [];
  const values = [];
  let paramCount = 1;
  
  if (filters.type) {
    conditions.push(`t.type = $${paramCount}`);
    values.push(filters.type);
    paramCount++;
  }
  
  if (filters.status) {
    conditions.push(`t.status = $${paramCount}`);
    values.push(filters.status);
    paramCount++;
  }
  
  if (filters.start_date) {
    conditions.push(`t.created_at >= $${paramCount}`);
    values.push(filters.start_date);
    paramCount++;
  }
  
  if (filters.end_date) {
    conditions.push(`t.created_at <= $${paramCount}`);
    values.push(filters.end_date);
    paramCount++;
  }
  
  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(" AND ")}`;
  }
  
  query += " ORDER BY t.created_at DESC";
  
  if (filters.limit) {
    query += ` LIMIT $${paramCount}`;
    values.push(filters.limit);
  }
  
  const result = await pool.query(query, values);
  return result.rows;
};

export const approveTransactionService = async (approvalData: ApproveTransactionInputType) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Update transaction status
    const transactionQuery = `
      UPDATE transactions 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    const transactionResult = await client.query(transactionQuery, [
      approvalData.status, approvalData.transaction_id
    ]);
    
    if (transactionResult.rows.length === 0) {
      throw new Error("Transaction not found");
    }
    
    const transaction = transactionResult.rows[0];
    
    // If transaction is completed and it's a deposit, update user balance
    if (approvalData.status === 'completed' && transaction.type === 'deposit') {
      const balanceQuery = `
        UPDATE user_balances 
        SET balance = balance + $1, total_deposited = total_deposited + $1, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $2
      `;
      await client.query(balanceQuery, [transaction.amount, transaction.user_id]);
    }
    
    // If transaction is completed and it's a withdrawal, update user balance
    if (approvalData.status === 'completed' && transaction.type === 'withdrawal') {
      const balanceQuery = `
        UPDATE user_balances 
        SET balance = balance - $1, total_withdrawn = total_withdrawn + $1, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $2
      `;
      await client.query(balanceQuery, [transaction.amount, transaction.user_id]);
    }
    
    await client.query('COMMIT');
    return transactionResult.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// =====================================================
// SETTINGS SERVICES
// =====================================================

export const getSystemSettingsService = async () => {
  const query = "SELECT * FROM system_settings WHERE id = 1";
  const result = await pool.query(query);
  return result.rows[0] || {};
};

export const updateSystemSettingsService = async (settings: UpdateSystemSettingsInputType) => {
  const fields: string[] = [];
  const values: any[] = [];
  let paramCount = 1;
  
  Object.entries(settings).forEach(([key, value]) => {
    if (value !== undefined) {
      fields.push(`${key} = $${paramCount}`);
      values.push(value);
      paramCount++;
    }
  });
  
  if (fields.length === 0) {
    throw new Error("No settings to update");
  }
  
  const query = `
    UPDATE system_settings 
    SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP
    WHERE id = 1
    RETURNING *
  `;
  
  const result = await pool.query(query, values);
  return result.rows[0];
};

// =====================================================
// ANALYTICS SERVICES
// =====================================================

export const getDashboardStatsService = async () => {
  const stats: any = {};
  
  // Total users
  const usersQuery = "SELECT COUNT(*) as total_users FROM users WHERE status_id = (SELECT id FROM statuses WHERE name = 'Active')";
  const usersResult = await pool.query(usersQuery);
  stats.totalUsers = parseInt(usersResult.rows[0].total_users);
  
  // Total games
  const gamesQuery = "SELECT COUNT(*) as total_games FROM games WHERE is_active = true";
  const gamesResult = await pool.query(gamesQuery);
  stats.totalGames = parseInt(gamesResult.rows[0].total_games);
  
  // Total transactions today
  const todayTransactionsQuery = `
    SELECT COUNT(*) as total_transactions, SUM(amount) as total_amount
    FROM transactions 
    WHERE DATE(created_at) = CURRENT_DATE
  `;
  const todayTransactionsResult = await pool.query(todayTransactionsQuery);
  stats.todayTransactions = parseInt(todayTransactionsResult.rows[0].total_transactions);
  stats.todayAmount = parseFloat(todayTransactionsResult.rows[0].total_amount || 0);
  
  // Pending transactions
  const pendingTransactionsQuery = `
    SELECT COUNT(*) as pending_count, SUM(amount) as pending_amount
    FROM transactions 
    WHERE status = 'pending'
  `;
  const pendingTransactionsResult = await pool.query(pendingTransactionsQuery);
  stats.pendingTransactions = parseInt(pendingTransactionsResult.rows[0].pending_count);
  stats.pendingAmount = parseFloat(pendingTransactionsResult.rows[0].pending_amount || 0);
  
  // Total wagered today
  const todayWageredQuery = `
    SELECT SUM(bet_amount) as total_wagered
    FROM bets 
    WHERE DATE(placed_at) = CURRENT_DATE
  `;
  const todayWageredResult = await pool.query(todayWageredQuery);
  stats.todayWagered = parseFloat(todayWageredResult.rows[0].total_wagered || 0);
  
  return stats;
};

export const getRevenueAnalyticsService = async (startDate: string, endDate: string) => {
  const query = `
    SELECT 
      DATE(created_at) as date,
      type,
      COUNT(*) as count,
      SUM(amount) as total_amount
    FROM transactions
    WHERE created_at BETWEEN $1 AND $2
    GROUP BY DATE(created_at), type
    ORDER BY date DESC, type
  `;
  
  const result = await pool.query(query, [startDate, endDate]);
  return result.rows;
};

export const getUserAnalyticsService = async (startDate: string, endDate: string) => {
  const query = `
    SELECT 
      DATE(u.created_at) as date,
      COUNT(*) as new_users,
      COUNT(CASE WHEN up.is_verified = true THEN 1 END) as verified_users
    FROM users u
    LEFT JOIN user_profiles up ON u.id = up.user_id
    WHERE u.created_at BETWEEN $1 AND $2
    GROUP BY DATE(u.created_at)
    ORDER BY date DESC
  `;
  
  const result = await pool.query(query, [startDate, endDate]);
  return result.rows;
}; 