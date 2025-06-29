import pool from "../../db/postgres";

export const getUserWithBalanceService = async (userId: number) => {
  const result = await pool.query(
    `
    SELECT 
      u.id, 
      u.username, 
      u.email, 
      u.created_at,
      s.name as status,
      
      -- Profile Information
      up.first_name,
      up.last_name,
      up.phone_number,
      up.date_of_birth,
      up.nationality,
      up.country,
      up.city,
      up.gender,
      up.avatar_url,
      up.timezone,
      up.language,
      up.currency,
      up.is_verified,
      up.verification_level,
      up.last_login_at,
      up.last_activity_at,
      
      -- Balance Information
      ub.balance,
      ub.bonus_balance,
      ub.locked_balance,
      ub.total_deposited,
      ub.total_withdrawn,
      ub.total_wagered,
      ub.total_won,
      
      -- Role Information
      r.name as role_name,
      r.description as role_description,
      
      -- Level Information
      ul.name as level_name,
      ul.description as level_description,
      ulp.current_points,
      ulp.total_points_earned,
      ul.cashback_percentage,
      ul.withdrawal_limit,
      
      -- KYC Status
      COUNT(kd.id) as kyc_documents_count,
      COUNT(CASE WHEN kd.status = 'approved' THEN 1 END) as kyc_approved_count,
      
      -- Gaming Statistics
      COUNT(DISTINCT b.id) as total_bets,
      COUNT(DISTINCT b.game_id) as games_played,
      COALESCE(SUM(b.bet_amount), 0) as total_wagered,
      COALESCE(SUM(b.win_amount), 0) as total_won,
      COALESCE(SUM(b.win_amount) - SUM(b.bet_amount), 0) as net_profit,
      MAX(b.placed_at) as last_bet_at,
      
      -- Transaction Summary
      COUNT(DISTINCT t.id) as total_transactions,
      COUNT(CASE WHEN t.type = 'deposit' THEN 1 END) as deposit_count,
      COUNT(CASE WHEN t.type = 'withdrawal' THEN 1 END) as withdrawal_count,
      
      -- Activity Summary
      COUNT(DISTINCT ual.id) as total_actions,
      MAX(ual.created_at) as last_activity,
      
      -- Session Information
      COUNT(DISTINCT us.id) as total_sessions,
      MAX(us.login_at) as last_login
      
    FROM 
      users u
    LEFT JOIN statuses s ON u.status_id = s.id
    LEFT JOIN user_profiles up ON u.id = up.user_id
    LEFT JOIN user_balances ub ON u.id = ub.user_id
    LEFT JOIN user_roles ur ON u.id = ur.user_id
    LEFT JOIN roles r ON ur.role_id = r.id
    LEFT JOIN user_level_progress ulp ON u.id = ulp.user_id
    LEFT JOIN user_levels ul ON ulp.level_id = ul.id
    LEFT JOIN kyc_documents kd ON u.id = kd.user_id
    LEFT JOIN bets b ON u.id = b.user_id
    LEFT JOIN transactions t ON u.id = t.user_id
    LEFT JOIN user_activity_logs ual ON u.id = ual.user_id
    LEFT JOIN user_sessions us ON u.id = us.user_id
    WHERE 
      u.id = $1
    GROUP BY 
      u.id, u.username, u.email, u.created_at, s.name,
      up.first_name, up.last_name, up.phone_number, up.date_of_birth, 
      up.nationality, up.country, up.city, up.gender, up.avatar_url, 
      up.timezone, up.language, up.currency, up.is_verified, up.verification_level,
      up.last_login_at, up.last_activity_at,
      ub.balance, ub.bonus_balance, ub.locked_balance, ub.total_deposited,
      ub.total_withdrawn, ub.total_wagered, ub.total_won,
      r.name, r.description,
      ul.name, ul.description, ulp.current_points, ulp.total_points_earned,
      ul.cashback_percentage, ul.withdrawal_limit
    `,
    [userId]
  );

  if (result.rows.length === 0) {
    throw new Error("User not found");
  }

  return result.rows[0];
};

// Get user's favorite games
export const getUserFavoriteGamesService = async (userId: number) => {
  const result = await pool.query(
    `
    SELECT 
      g.id,
      g.name,
      g.provider,
      g.category,
      g.subcategory,
      g.image_url,
      ugp.play_count,
      ugp.total_time_played,
      ugp.last_played_at,
      ugp.is_favorite
    FROM user_game_preferences ugp
    JOIN games g ON ugp.game_id = g.id
    WHERE ugp.user_id = $1 AND (ugp.is_favorite = TRUE OR ugp.play_count > 0)
    ORDER BY ugp.play_count DESC, ugp.last_played_at DESC
    LIMIT 10
    `,
    [userId]
  );

  return result.rows;
};

// Get user's recent activity
export const getUserRecentActivityService = async (userId: number, limit: number = 20) => {
  const result = await pool.query(
    `
    SELECT 
      action,
      category,
      description,
      created_at,
      ip_address
    FROM user_activity_logs
    WHERE user_id = $1
    ORDER BY created_at DESC
    LIMIT $2
    `,
    [userId, limit]
  );

  return result.rows;
};

// Get user's transaction history
export const getUserTransactionHistoryService = async (userId: number, limit: number = 50) => {
  const result = await pool.query(
    `
    SELECT 
      id,
      type,
      amount,
      balance_before,
      balance_after,
      currency,
      status,
      description,
      created_at
    FROM transactions
    WHERE user_id = $1
    ORDER BY created_at DESC
    LIMIT $2
    `,
    [userId, limit]
  );

  return result.rows;
};

// Get user's betting history
export const getUserBettingHistoryService = async (userId: number, limit: number = 50) => {
  const result = await pool.query(
    `
    SELECT 
      b.id,
      b.bet_amount,
      b.win_amount,
      b.outcome,
      b.placed_at,
      b.result_at,
      g.name as game_name,
      g.provider,
      g.category
    FROM bets b
    JOIN games g ON b.game_id = g.id
    WHERE b.user_id = $1
    ORDER BY b.placed_at DESC
    LIMIT $2
    `,
    [userId, limit]
  );

  return result.rows;
};

// Get user by username
export const getUserByUsernameService = async (username: string) => {
  const result = await pool.query(
    `
    SELECT 
      u.id, 
      u.username, 
      u.email, 
      u.password,
      u.created_at,
      s.name as status
    FROM users u
    LEFT JOIN statuses s ON u.status_id = s.id
    WHERE u.username = $1
    LIMIT 1
    `,
    [username]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
};

// Get user roles by username
export const getUserRolesService = async (username: string) => {
  const result = await pool.query(
    `
    SELECT 
      r.id,
      r.name,
      r.description
    FROM users u
    INNER JOIN user_roles ur ON u.id = ur.user_id
    INNER JOIN roles r ON ur.role_id = r.id
    WHERE u.username = $1
    ORDER BY r.name
    `,
    [username]
  );

  return result.rows;
};

// Get comprehensive user activity summary
export const getUserActivitySummaryService = async (userId: number) => {
  const result = await pool.query(
    `
    SELECT 
      uas.user_id,
      uas.username,
      uas.total_actions,
      uas.active_days,
      uas.last_activity,
      uas.unique_actions,
      uas.login_count,
      uas.gaming_actions,
      uas.financial_actions,
      
      -- Additional gaming metrics
      COALESCE(COUNT(DISTINCT b.id), 0) as total_bets,
      COALESCE(SUM(b.bet_amount), 0) as total_wagered,
      COALESCE(SUM(b.win_amount), 0) as total_won,
      COALESCE(COUNT(DISTINCT b.game_id), 0) as games_played,
      MAX(b.placed_at) as last_bet_at,
      
      -- Additional financial metrics
      COALESCE(COUNT(DISTINCT t.id), 0) as total_transactions,
      COALESCE(COUNT(CASE WHEN t.type = 'deposit' THEN 1 END), 0) as deposit_count,
      COALESCE(COUNT(CASE WHEN t.type = 'withdrawal' THEN 1 END), 0) as withdrawal_count,
      COALESCE(SUM(CASE WHEN t.type = 'deposit' THEN t.amount ELSE 0 END), 0) as total_deposited,
      COALESCE(SUM(CASE WHEN t.type = 'withdrawal' THEN t.amount ELSE 0 END), 0) as total_withdrawn,
      
      -- Session metrics
      COALESCE(COUNT(DISTINCT us.id), 0) as total_sessions,
      MAX(us.login_at) as last_login,
      MAX(us.last_activity_at) as last_session_activity,
      
      -- Level and progress
      ul.name as current_level,
      ulp.current_points,
      ulp.total_points_earned,
      
      -- Balance information
      ub.balance,
      ub.bonus_balance,
      ub.locked_balance
      
    FROM user_activity_summary uas
    LEFT JOIN users u ON uas.user_id = u.id
    LEFT JOIN bets b ON u.id = b.user_id
    LEFT JOIN transactions t ON u.id = t.user_id
    LEFT JOIN user_sessions us ON u.id = us.user_id
    LEFT JOIN user_level_progress ulp ON u.id = ulp.user_id
    LEFT JOIN user_levels ul ON ulp.level_id = ul.id
    LEFT JOIN user_balances ub ON u.id = ub.user_id
    WHERE uas.user_id = $1
    GROUP BY 
      uas.user_id, uas.username, uas.total_actions, uas.active_days, 
      uas.last_activity, uas.unique_actions, uas.login_count, 
      uas.gaming_actions, uas.financial_actions,
      ul.name, ulp.current_points, ulp.total_points_earned,
      ub.balance, ub.bonus_balance, ub.locked_balance
    `,
    [userId]
  );

  if (result.rows.length === 0) {
    // If no activity summary exists, create a basic one
    const basicResult = await pool.query(
      `
      SELECT 
        u.id as user_id,
        u.username,
        0 as total_actions,
        0 as active_days,
        u.created_at as last_activity,
        0 as unique_actions,
        0 as login_count,
        0 as gaming_actions,
        0 as financial_actions,
        0 as total_bets,
        0 as total_wagered,
        0 as total_won,
        0 as games_played,
        NULL as last_bet_at,
        0 as total_transactions,
        0 as deposit_count,
        0 as withdrawal_count,
        0 as total_deposited,
        0 as total_withdrawn,
        0 as total_sessions,
        NULL as last_login,
        NULL as last_session_activity,
        ul.name as current_level,
        COALESCE(ulp.current_points, 0) as current_points,
        COALESCE(ulp.total_points_earned, 0) as total_points_earned,
        COALESCE(ub.balance, 0) as balance,
        COALESCE(ub.bonus_balance, 0) as bonus_balance,
        COALESCE(ub.locked_balance, 0) as locked_balance
      FROM users u
      LEFT JOIN user_level_progress ulp ON u.id = ulp.user_id
      LEFT JOIN user_levels ul ON ulp.level_id = ul.id
      LEFT JOIN user_balances ub ON u.id = ub.user_id
      WHERE u.id = $1
      `,
      [userId]
    );
    
    return basicResult.rows[0];
  }

  return result.rows[0];
};