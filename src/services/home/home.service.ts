import { pool } from "../../db/postgres";
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
    const [gamesResult] = await pool.execute(
      "SELECT COUNT(*) as total_games FROM games WHERE is_active = 1"
    );
    
    const [categoriesResult] = await pool.execute(
      "SELECT COUNT(DISTINCT category) as total_categories FROM games WHERE is_active = 1"
    );
    
    const [providersResult] = await pool.execute(
      "SELECT COUNT(DISTINCT provider) as total_providers FROM games WHERE is_active = 1"
    );
    
    const [activePlayersResult] = await pool.execute(
      "SELECT COUNT(*) as active_players FROM user_sessions WHERE last_activity > DATE_SUB(NOW(), INTERVAL 24 HOUR)"
    );

    return {
      total_games: (gamesResult as any)[0]?.total_games || 0,
      total_categories: (categoriesResult as any)[0]?.total_categories || 0,
      total_providers: (providersResult as any)[0]?.total_providers || 0,
      active_players: (activePlayersResult as any)[0]?.active_players || 0,
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
    const [balanceResult] = await pool.execute(
      "SELECT balance FROM user_balances WHERE user_id = ?",
      [userId]
    );
    
    const [betsResult] = await pool.execute(
      "SELECT COUNT(*) as total_bets, SUM(bet_amount) as total_bet_amount FROM bets WHERE user_id = ?",
      [userId]
    );
    
    const [winsResult] = await pool.execute(
      "SELECT SUM(win_amount) as total_wins FROM bets WHERE user_id = ? AND outcome = 'win'",
      [userId]
    );
    
    const [favoritesResult] = await pool.execute(
      "SELECT COUNT(*) as favorite_games_count FROM user_game_preferences WHERE user_id = ? AND is_favorite = 1",
      [userId]
    );
    
    const [levelResult] = await pool.execute(
      `SELECT ul.level_name, ul.min_points, ul.max_points, up.points 
       FROM user_levels ul 
       JOIN user_profiles up ON up.user_id = ? 
       WHERE up.points BETWEEN ul.min_points AND ul.max_points`,
      [userId]
    );

    const balance = (balanceResult as any)[0]?.balance || 0;
    const totalBets = (betsResult as any)[0]?.total_bets || 0;
    const totalWins = (winsResult as any)[0]?.total_wins || 0;
    const favoriteGamesCount = (favoritesResult as any)[0]?.favorite_games_count || 0;
    const levelData = (levelResult as any)[0];
    
    const levelProgress = levelData ? 
      ((levelData.points - levelData.min_points) / (levelData.max_points - levelData.min_points)) * 100 : 0;

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
    const [activityResult] = await pool.execute(
      `SELECT 
        'bet' as type,
        b.id,
        g.name as game_name,
        b.bet_amount,
        b.outcome,
        b.win_amount,
        b.created_at,
        b.updated_at
       FROM bets b
       JOIN games g ON b.game_id = g.id
       WHERE b.user_id = ?
       ORDER BY b.created_at DESC
       LIMIT 10`,
      [userId]
    );

    return (activityResult as any[]).map(activity => ({
      ...activity,
      created_at: activity.created_at,
      updated_at: activity.updated_at,
    }));
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    return [];
  }
};

const getActivePromotions = async () => {
  try {
    const [promotionsResult] = await pool.execute(
      `SELECT 
        id,
        title,
        description,
        promo_type,
        bonus_amount,
        wagering_requirement,
        start_date,
        end_date,
        is_active
       FROM promotions 
       WHERE is_active = 1 
       AND start_date <= NOW() 
       AND end_date >= NOW()
       ORDER BY created_at DESC
       LIMIT 5`
    );

    return (promotionsResult as any[]).map(promo => ({
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
    const [announcementsResult] = await pool.execute(
      `SELECT 
        id,
        title,
        content,
        announcement_type,
        priority,
        created_at
       FROM announcements 
       WHERE is_active = 1 
       AND (expires_at IS NULL OR expires_at >= NOW())
       ORDER BY priority DESC, created_at DESC
       LIMIT 3`
    );

    return (announcementsResult as any[]).map(announcement => ({
      ...announcement,
      created_at: announcement.created_at,
    }));
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return [];
  }
}; 