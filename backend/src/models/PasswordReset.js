const pool = require('../config/database');

const PasswordReset = {
  create: async (userId, token, expiresAt) => {
    const result = await pool.query(
      'INSERT INTO password_resets (user_id, token, expires_at) VALUES ($1, $2, $3) RETURNING *',
      [userId, token, expiresAt]
    );
    return result.rows[0];
  },

  findByToken: async (token) => {
    const result = await pool.query(
      'SELECT * FROM password_resets WHERE token = $1',
      [token]
    );
    return result.rows[0];
  },

  deleteById: async (id) => {
    await pool.query('DELETE FROM password_resets WHERE id = $1', [id]);
  },

  deleteByToken: async (token) => {
    await pool.query('DELETE FROM password_resets WHERE token = $1', [token]);
  },

  deleteExpired: async () => {
    await pool.query('DELETE FROM password_resets WHERE expires_at < NOW()');
  }
};

module.exports = { PasswordReset };