import pool from "../../db/postgres";
import { ApiError } from "../../utils/apiError";

// Get all available games with filtering
export const getAvailableGamesService = async (filters: {
  category?: string;
  provider?: string;
  is_featured?: boolean;
  is_new?: boolean;
  is_hot?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}) => {
  const {
    category,
    provider,
    is_featured,
    is_new,
    is_hot,
    search,
    limit = 50,
    offset = 0
  } = filters;

  let query = `
    SELECT 
      id,
      name,
      provider,
      category,
      subcategory,
      image_url,
      thumbnail_url,
      game_code,
      rtp_percentage,
      volatility,
      min_bet,
      max_bet,
      max_win,
      is_featured,
      is_new,
      is_hot,
      is_active,
      created_at
    FROM games 
    WHERE is_active = TRUE
  `;

  const params: any[] = [];
  let paramCount = 0;

  if (category) {
    paramCount++;
    query += ` AND category = $${paramCount}`;
    params.push(category);
  }

  if (provider) {
    paramCount++;
    query += ` AND provider = $${paramCount}`;
    params.push(provider);
  }

  if (is_featured !== undefined) {
    paramCount++;
    query += ` AND is_featured = $${paramCount}`;
    params.push(is_featured);
  }

  if (is_new !== undefined) {
    paramCount++;
    query += ` AND is_new = $${paramCount}`;
    params.push(is_new);
  }

  if (is_hot !== undefined) {
    paramCount++;
    query += ` AND is_hot = $${paramCount}`;
    params.push(is_hot);
  }

  if (search) {
    paramCount++;
    query += ` AND (name ILIKE $${paramCount} OR provider ILIKE $${paramCount})`;
    params.push(`%${search}%`);
  }

  query += ` ORDER BY is_featured DESC, is_hot DESC, is_new DESC, name ASC`;
  query += ` LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
  params.push(limit, offset);

  const result = await pool.query(query, params);
  return result.rows;
};

// Get game by ID with detailed information
export const getGameByIdService = async (gameId: number) => {
  const result = await pool.query(
    `
    SELECT 
      id,
      name,
      provider,
      category,
      subcategory,
      image_url,
      thumbnail_url,
      game_code,
      rtp_percentage,
      volatility,
      min_bet,
      max_bet,
      max_win,
      is_featured,
      is_new,
      is_hot,
      is_active,
      created_at,
      updated_at
    FROM games 
    WHERE id = $1 AND is_active = TRUE
    `,
    [gameId]
  );

  if (result.rows.length === 0) {
    throw new ApiError("Game not found", 404);
  }

  return result.rows[0];
};

// Get game categories
export const getGameCategoriesService = async () => {
  const result = await pool.query(
    `
    SELECT DISTINCT 
      category,
      COUNT(*) as game_count
    FROM games 
    WHERE is_active = TRUE
    GROUP BY category
    ORDER BY game_count DESC, category ASC
    `
  );

  return result.rows;
};

// Get game providers
export const getGameProvidersService = async () => {
  const result = await pool.query(
    `
    SELECT DISTINCT 
      provider,
      COUNT(*) as game_count
    FROM games 
    WHERE is_active = TRUE
    GROUP BY provider
    ORDER BY game_count DESC, provider ASC
    `
  );

  return result.rows;
};

// Get featured games
export const getFeaturedGamesService = async (limit: number = 10) => {
  const result = await pool.query(
    `
    SELECT 
      id,
      name,
      provider,
      category,
      subcategory,
      image_url,
      thumbnail_url,
      game_code,
      rtp_percentage,
      volatility,
      min_bet,
      max_bet,
      max_win,
      is_featured,
      is_new,
      is_hot
    FROM games 
    WHERE is_active = TRUE AND is_featured = TRUE
    ORDER BY created_at DESC
    LIMIT $1
    `,
    [limit]
  );

  return result.rows;
};

// Get new games
export const getNewGamesService = async (limit: number = 10) => {
  const result = await pool.query(
    `
    SELECT 
      id,
      name,
      provider,
      category,
      subcategory,
      image_url,
      thumbnail_url,
      game_code,
      rtp_percentage,
      volatility,
      min_bet,
      max_bet,
      max_win,
      is_featured,
      is_new,
      is_hot
    FROM games 
    WHERE is_active = TRUE AND is_new = TRUE
    ORDER BY created_at DESC
    LIMIT $1
    `,
    [limit]
  );

  return result.rows;
};

// Get hot games
export const getHotGamesService = async (limit: number = 10) => {
  const result = await pool.query(
    `
    SELECT 
      id,
      name,
      provider,
      category,
      subcategory,
      image_url,
      thumbnail_url,
      game_code,
      rtp_percentage,
      volatility,
      min_bet,
      max_bet,
      max_win,
      is_featured,
      is_new,
      is_hot
    FROM games 
    WHERE is_active = TRUE AND is_hot = TRUE
    ORDER BY created_at DESC
    LIMIT $1
    `,
    [limit]
  );

  return result.rows;
};

// Toggle game favorite status
export const toggleGameFavoriteService = async (userId: number, gameId: number) => {
  // Check if game exists
  const gameExists = await pool.query(
    "SELECT id FROM games WHERE id = $1 AND is_active = TRUE",
    [gameId]
  );

  if (gameExists.rows.length === 0) {
    throw new ApiError("Game not found", 404);
  }

  // Check if preference exists
  const existingPreference = await pool.query(
    "SELECT id, is_favorite FROM user_game_preferences WHERE user_id = $1 AND game_id = $2",
    [userId, gameId]
  );

  if (existingPreference.rows.length > 0) {
    // Update existing preference
    const newFavoriteStatus = !existingPreference.rows[0].is_favorite;
    await pool.query(
      "UPDATE user_game_preferences SET is_favorite = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2 AND game_id = $3",
      [newFavoriteStatus, userId, gameId]
    );
    return { is_favorite: newFavoriteStatus };
  } else {
    // Create new preference
    await pool.query(
      "INSERT INTO user_game_preferences (user_id, game_id, is_favorite) VALUES ($1, $2, TRUE)",
      [userId, gameId]
    );
    return { is_favorite: true };
  }
};

// Record game play (increment play count and update last played)
export const recordGamePlayService = async (userId: number, gameId: number, playTimeSeconds: number = 0) => {
  // Check if game exists
  const gameExists = await pool.query(
    "SELECT id FROM games WHERE id = $1 AND is_active = TRUE",
    [gameId]
  );

  if (gameExists.rows.length === 0) {
    throw new ApiError("Game not found", 404);
  }

  // Update or create game preference
  const existingPreference = await pool.query(
    "SELECT id FROM user_game_preferences WHERE user_id = $1 AND game_id = $2",
    [userId, gameId]
  );

  if (existingPreference.rows.length > 0) {
    // Update existing preference
    await pool.query(
      `
      UPDATE user_game_preferences 
      SET play_count = play_count + 1, 
          total_time_played = total_time_played + $1,
          last_played_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $2 AND game_id = $3
      `,
      [playTimeSeconds, userId, gameId]
    );
  } else {
    // Create new preference
    await pool.query(
      `
      INSERT INTO user_game_preferences 
      (user_id, game_id, play_count, total_time_played, last_played_at) 
      VALUES ($1, $2, 1, $3, CURRENT_TIMESTAMP)
      `,
      [userId, gameId, playTimeSeconds]
    );
  }
};

// Place a bet on a game
export const placeBetService = async (
  userId: number, 
  gameId: number, 
  betAmount: number,
  gameData?: any
) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Check if game exists and is active
    const gameResult = await client.query(
      "SELECT id, min_bet, max_bet FROM games WHERE id = $1 AND is_active = TRUE",
      [gameId]
    );

    if (gameResult.rows.length === 0) {
      throw new ApiError("Game not found or inactive", 404);
    }

    const game = gameResult.rows[0];

    // Validate bet amount
    if (betAmount < game.min_bet || betAmount > game.max_bet) {
      throw new ApiError(`Bet amount must be between $${game.min_bet} and $${game.max_bet}`, 400);
    }

    // Check user balance
    const balanceResult = await client.query(
      "SELECT balance FROM user_balances WHERE user_id = $1",
      [userId]
    );

    if (balanceResult.rows.length === 0) {
      throw new ApiError("User balance not found", 404);
    }

    const currentBalance = balanceResult.rows[0].balance;

    if (currentBalance < betAmount) {
      throw new ApiError("Insufficient balance", 400);
    }

    // Create transaction record
    const transactionResult = await client.query(
      `
      INSERT INTO transactions 
      (user_id, type, amount, balance_before, balance_after, status, description)
      VALUES ($1, 'bet', $2, $3, $4, 'completed', 'Bet placed on game')
      RETURNING id
      `,
      [userId, betAmount, currentBalance, currentBalance - betAmount]
    );

    const transactionId = transactionResult.rows[0].id;

    // Create bet record
    const betResult = await client.query(
      `
      INSERT INTO bets 
      (user_id, game_id, transaction_id, bet_amount, outcome, game_data, placed_at)
      VALUES ($1, $2, $3, $4, 'pending', $5, CURRENT_TIMESTAMP)
      RETURNING id
      `,
      [userId, gameId, transactionId, betAmount, gameData ? JSON.stringify(gameData) : null]
    );

    // Update user balance
    await client.query(
      "UPDATE user_balances SET balance = balance - $1, total_wagered = total_wagered + $1 WHERE user_id = $2",
      [betAmount, userId]
    );

    // Record activity
    await client.query(
      `
      INSERT INTO user_activity_logs 
      (user_id, action, category, description, metadata)
      VALUES ($1, 'place_bet', 'gaming', 'Placed bet on game', $2)
      `,
      [userId, JSON.stringify({ game_id: gameId, bet_amount: betAmount, bet_id: betResult.rows[0].id })]
    );

    await client.query('COMMIT');

    return {
      bet_id: betResult.rows[0].id,
      transaction_id: transactionId,
      bet_amount: betAmount,
      new_balance: currentBalance - betAmount
    };

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Process bet result (win/lose)
export const processBetResultService = async (
  betId: number,
  outcome: 'win' | 'lose',
  winAmount: number = 0,
  gameResult?: any
) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Get bet details
    const betResult = await client.query(
      "SELECT user_id, bet_amount, transaction_id FROM bets WHERE id = $1",
      [betId]
    );

    if (betResult.rows.length === 0) {
      throw new ApiError("Bet not found", 404);
    }

    const bet = betResult.rows[0];

    // Update bet with result
    await client.query(
      `
      UPDATE bets 
      SET outcome = $1, win_amount = $2, result_at = CURRENT_TIMESTAMP, game_data = $3
      WHERE id = $4
      `,
      [outcome, winAmount, gameResult ? JSON.stringify(gameResult) : null, betId]
    );

    if (outcome === 'win' && winAmount > 0) {
      // Create win transaction
      const winTransactionResult = await client.query(
        `
        INSERT INTO transactions 
        (user_id, type, amount, status, description)
        VALUES ($1, 'win', $2, 'completed', 'Bet win')
        RETURNING id
        `,
        [bet.user_id, winAmount]
      );

      // Update user balance
      await client.query(
        "UPDATE user_balances SET balance = balance + $1, total_won = total_won + $1 WHERE user_id = $2",
        [winAmount, bet.user_id]
      );

      // Record activity
      await client.query(
        `
        INSERT INTO user_activity_logs 
        (user_id, action, category, description, metadata)
        VALUES ($1, 'bet_win', 'gaming', 'Won bet', $2)
        `,
        [bet.user_id, JSON.stringify({ bet_id: betId, win_amount: winAmount })]
      );
    } else {
      // Record loss activity
      await client.query(
        `
        INSERT INTO user_activity_logs 
        (user_id, action, category, description, metadata)
        VALUES ($1, 'bet_loss', 'gaming', 'Lost bet', $2)
        `,
        [bet.user_id, JSON.stringify({ bet_id: betId, bet_amount: bet.bet_amount })]
      );
    }

    await client.query('COMMIT');

    return {
      bet_id: betId,
      outcome,
      win_amount: winAmount,
      user_id: bet.user_id
    };

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Get game statistics
export const getGameStatisticsService = async (gameId: number) => {
  const result = await pool.query(
    `
    SELECT 
      g.id,
      g.name,
      g.provider,
      g.category,
      COUNT(DISTINCT b.id) as total_bets,
      COUNT(DISTINCT b.user_id) as unique_players,
      COALESCE(SUM(b.bet_amount), 0) as total_wagered,
      COALESCE(SUM(b.win_amount), 0) as total_won,
      COALESCE(AVG(b.bet_amount), 0) as avg_bet_amount,
      COUNT(CASE WHEN b.outcome = 'win' THEN 1 END) as total_wins,
      COUNT(CASE WHEN b.outcome = 'lose' THEN 1 END) as total_losses,
      MAX(b.placed_at) as last_bet_at
    FROM games g
    LEFT JOIN bets b ON g.id = b.game_id
    WHERE g.id = $1
    GROUP BY g.id, g.name, g.provider, g.category
    `,
    [gameId]
  );

  if (result.rows.length === 0) {
    throw new ApiError("Game not found", 404);
  }

  return result.rows[0];
};

// Get popular games (by bet count)
export const getPopularGamesService = async (limit: number = 10) => {
  const result = await pool.query(
    `
    SELECT 
      g.id,
      g.name,
      g.provider,
      g.category,
      g.image_url,
      g.thumbnail_url,
      COUNT(DISTINCT b.id) as bet_count,
      COUNT(DISTINCT b.user_id) as player_count,
      COALESCE(SUM(b.bet_amount), 0) as total_wagered
    FROM games g
    LEFT JOIN bets b ON g.id = b.game_id
    WHERE g.is_active = TRUE
    GROUP BY g.id, g.name, g.provider, g.category, g.image_url, g.thumbnail_url
    ORDER BY bet_count DESC, total_wagered DESC
    LIMIT $1
    `,
    [limit]
  );

  return result.rows;
}; 