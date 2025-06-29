import pool from "../../db/postgres";
import { getAvailableGamesService } from "../game/game.service";

export interface HomeData {
  featured_games: any[];
  new_games: any[];
  hot_games: any[];
  popular_games: any[];
  user_stats?: {
    total_balance: number;
    total_bets: number;
    total_wins: number;
    favorite_games_count: number;
    level_name: string;
    level_progress: number;
  };
  recent_activity?: any[];
  promotions?: any[];
  announcements?: any[];
  quick_stats?: {
    total_games: number;
    total_categories: number;
    total_providers: number;
    active_players: number;
  };
}

export const getHomeDataService = async (userId?: number): Promise<HomeData> => {
  try {
    // Get featured games (limit 6)
    const featuredGames = await getAvailableGamesService({ is_featured: true, limit: 6 });
    
    // Get new games (limit 6)
    const newGames = await getAvailableGamesService({ is_new: true, limit: 6 });
    
    // Get hot games (limit 6)
    const hotGames = await getAvailableGamesService({ is_hot: true, limit: 6 });
    
    // Get popular games (limit 6)
    const popularGames = await getAvailableGamesService({ limit: 6 });

    const homeData: HomeData = {
      featured_games: featuredGames,
      new_games: newGames,
      hot_games: hotGames,
      popular_games: popularGames,
      quick_stats: await getQuickStats(),
    };

    // If user is authenticated, add personalized data
    if (userId) {
      homeData.user_stats = await getUserStats(userId);
      homeData.recent_activity = await getRecentActivity(userId);
    }

    // Add promotions and announcements
    homeData.promotions = await getActivePromotions();
    homeData.announcements = await getAnnouncements();

    return homeData;
  } catch (error) {
    console.error("Error fetching home data:", error);
    throw error;
  }
};

const getQuickStats = async () => {
  try {
    const gamesResult = await pool.query(
      "SELECT COUNT(*) as total_games FROM games WHERE is_active = true"
    );
    
    const categoriesResult = await pool.query(
      "SELECT COUNT(DISTINCT category) as total_categories FROM games WHERE is_active = true"
    );
    
    const providersResult = await pool.query(
      "SELECT COUNT(DISTINCT provider) as total_providers FROM games WHERE is_active = true"
    );
    
    const activePlayersResult = await pool.query(
      "SELECT COUNT(*) as active_players FROM users u JOIN statuses s ON u.status_id = s.id WHERE s.name = 'Active'"
    );

    return {
      total_games: gamesResult.rows[0]?.total_games || 0,
      total_categories: categoriesResult.rows[0]?.total_categories || 0,
      total_providers: providersResult.rows[0]?.total_providers || 0,
      active_players: activePlayersResult.rows[0]?.active_players || 0,
    };
  } catch (error) {
    console.error("Error fetching quick stats:", error);
    return {
      total_games: 0,
      total_categories: 0,
      total_providers: 0,
      active_players: 0,
    };
  }
};

const getUserStats = async (userId: number) => {
  try {
    const balanceResult = await pool.query(
      "SELECT balance, bonus_balance, locked_balance FROM user_balances WHERE user_id = $1",
      [userId]
    );
    
    const betsResult = await pool.query(
      "SELECT COUNT(*) as total_bets, SUM(bet_amount) as total_wagered FROM bets WHERE user_id = $1",
      [userId]
    );
    
    const winsResult = await pool.query(
      "SELECT COUNT(*) as total_wins, SUM(win_amount) as total_won FROM bets WHERE user_id = $1 AND outcome = 'win'",
      [userId]
    );
    
    const favoritesResult = await pool.query(
      "SELECT COUNT(*) as favorite_games FROM user_game_preferences WHERE user_id = $1 AND is_favorite = true",
      [userId]
    );
    
    const levelResult = await pool.query(
      "SELECT ul.name as level_name, ulp.current_points, ulp.total_points_earned FROM user_level_progress ulp JOIN user_levels ul ON ulp.level_id = ul.id WHERE ulp.user_id = $1",
      [userId]
    );

    const balance = balanceResult.rows[0]?.balance || 0;
    const totalBets = betsResult.rows[0]?.total_bets || 0;
    const totalWins = winsResult.rows[0]?.total_wins || 0;
    const favoriteGamesCount = favoritesResult.rows[0]?.favorite_games || 0;
    const levelData = levelResult.rows[0];
    
    const levelProgress = levelData ? 
      ((levelData.current_points - levelData.min_points) / (levelData.max_points - levelData.min_points)) * 100 : 0;

    return {
      total_balance: balance,
      total_bets: totalBets,
      total_wins: totalWins,
      favorite_games_count: favoriteGamesCount,
      level_name: levelData?.level_name || "Bronze",
      level_progress: Math.min(100, Math.max(0, levelProgress)),
    };
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return {
      total_balance: 0,
      total_bets: 0,
      total_wins: 0,
      favorite_games_count: 0,
      level_name: "Bronze",
      level_progress: 0,
    };
  }
};

const getRecentActivity = async (userId: number) => {
  try {
    const activityResult = await pool.query(
      "SELECT action, category, description, created_at FROM user_activity_logs WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2",
      [userId, 10]
    );

    return activityResult.rows.map(activity => ({
      ...activity,
      created_at: activity.created_at,
    }));
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    return [];
  }
};

const getActivePromotions = async () => {
  try {
    const promotionsResult = await pool.query(
      "SELECT id, name, description, type, value, start_date, end_date, is_active FROM promotions WHERE is_active = true AND (end_date IS NULL OR end_date > CURRENT_TIMESTAMP) ORDER BY created_at DESC LIMIT 5"
    );

    return promotionsResult.rows.map(promo => ({
      ...promo,
      start_date: promo.start_date,
      end_date: promo.end_date,
    }));
  } catch (error) {
    console.error("Error fetching promotions:", error);
    return [];
  }
};

const getAnnouncements = async () => {
  try {
    const announcementsResult = await pool.query(
      "SELECT id, title, content, type, is_active, created_at FROM announcements WHERE is_active = true ORDER BY created_at DESC LIMIT 5"
    );

    return announcementsResult.rows.map(announcement => ({
      ...announcement,
      created_at: announcement.created_at,
    }));
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return [];
  }
}; 