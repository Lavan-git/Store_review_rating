const pool = require('../config/database');
const bcrypt = require('bcryptjs');

// User model
const User = {
  findById: async (id) => {
    const result = await pool.query('SELECT id, name, email, address, role, created_at FROM users WHERE id = $1', [id]);
    return result.rows[0];
  },

  findByEmail: async (email) => {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  },

  create: async (name, email, password, address, role = 'normal_user') => {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (name, email, password, address, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, address, role',
      [name, email, hashedPassword, address, role]
    );
    return result.rows[0];
  },

  findAll: async (filters = {}, sort = {}) => {
    let query = 'SELECT id, name, email, address, role, created_at FROM users';
    const values = [];
    let whereConditions = [];
    let paramCount = 1;

    if (filters.name) {
      whereConditions.push(`name ILIKE $${paramCount++}`);
      values.push(`%${filters.name}%`);
    }
    if (filters.email) {
      whereConditions.push(`email ILIKE $${paramCount++}`);
      values.push(`%${filters.email}%`);
    }
    if (filters.address) {
      whereConditions.push(`address ILIKE $${paramCount++}`);
      values.push(`%${filters.address}%`);
    }
    if (filters.role) {
      whereConditions.push(`role = $${paramCount++}`);
      values.push(filters.role);
    }

    if (whereConditions.length > 0) {
      query += ' WHERE ' + whereConditions.join(' AND ');
    }

    // Add sorting
    if (sort.field) {
      const validFields = ['name', 'email', 'address', 'role', 'created_at'];
      if (validFields.includes(sort.field)) {
        query += ` ORDER BY ${sort.field} ${sort.direction === 'desc' ? 'DESC' : 'ASC'}`;
      }
    }

    const result = await pool.query(query, values);
    return result.rows;
  },

  updatePassword: async (userId, newPassword) => {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const result = await pool.query(
      'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id',
      [hashedPassword, userId]
    );
    return result.rows[0];
  },

  verifyPassword: async (password, hash) => {
    return await bcrypt.compare(password, hash);
  }
  ,

  update: async (userId, fields = {}) => {
    const allowed = ['name', 'email', 'address', 'role'];
    const setClauses = [];
    const values = [];
    let idx = 1;

    for (const key of allowed) {
      if (fields[key] !== undefined) {
        setClauses.push(`${key} = $${idx++}`);
        values.push(fields[key]);
      }
    }

    if (setClauses.length === 0) return null;

    values.push(userId);
    const query = `UPDATE users SET ${setClauses.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${idx} RETURNING id, name, email, address, role`;
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  delete: async (userId) => {
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [userId]);
    return result.rows[0];
  }
};

module.exports = { User };
