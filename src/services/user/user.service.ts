import pool from "../../db/postgres";

export const getUserWithBalanceService = async (userId: number) => {
  const result = await pool.query(
    `
    SELECT 
      u.id, u.username, u.email, ub.balance
    FROM 
      users u
    JOIN 
      user_balances ub ON u.id = ub.user_id
    WHERE 
      u.id = $1
    `,
    [userId]
  );

  if (result.rows.length === 0) {
    throw new Error("User not found");
  }

  return result.rows[0];
};