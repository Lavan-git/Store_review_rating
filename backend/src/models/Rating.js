const pool = require('../config/database');

// Rating model
const Rating = {
  findByUserAndStore: async (userId, storeId) => {
    const result = await pool.query(
      'SELECT * FROM ratings WHERE user_id = $1 AND store_id = $2',
      [userId, storeId]
    );
    return result.rows[0];
  },

  create: async (userId, storeId, rating, comment = null) => {
    const result = await pool.query(
      'INSERT INTO ratings (user_id, store_id, rating, comment) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, storeId, rating, comment]
    );
    return result.rows[0];
  },

  update: async (userId, storeId, rating, comment = null) => {
    const result = await pool.query(
      'UPDATE ratings SET rating = $1, comment = $2, updated_at = CURRENT_TIMESTAMP WHERE user_id = $3 AND store_id = $4 RETURNING *',
      [rating, comment, userId, storeId]
    );
    return result.rows[0];
  },

  getStoreAverageRating: async (storeId) => {
    const result = await pool.query(
      'SELECT COALESCE(ROUND(AVG(rating)::numeric, 2), 0) as average_rating FROM ratings WHERE store_id = $1',
      [storeId]
    );
    return result.rows[0];
  },

  getRatingsForStore: async (storeId) => {
    const result = await pool.query(
      `SELECT r.id, r.user_id, r.rating, r.comment, r.created_at, u.name as user_name, u.email as user_email
       FROM ratings r
       JOIN users u ON r.user_id = u.id
       WHERE r.store_id = $1
       ORDER BY r.created_at DESC`,
      [storeId]
    );
    return result.rows;
  },

  getTotalRatingsCount: async () => {
    const result = await pool.query('SELECT COUNT(*) as count FROM ratings');
    return parseInt(result.rows[0].count);
  }
};

module.exports = { Rating };
