const pool = require('../config/database');

// Store model
const Store = {
  findById: async (id) => {
    const result = await pool.query(
      `SELECT s.id, s.name, s.email, s.address, s.owner_id, 
              COALESCE(ROUND(AVG(r.rating)::numeric, 2), 0) as average_rating
       FROM stores s
       LEFT JOIN ratings r ON s.id = r.store_id
       WHERE s.id = $1
       GROUP BY s.id`,
      [id]
    );
    return result.rows[0];
  },

  findAll: async (filters = {}, sort = {}) => {
    let query = `SELECT s.id, s.name, s.email, s.address, s.owner_id,
                 COALESCE(ROUND(AVG(r.rating)::numeric, 2), 0) as average_rating
                 FROM stores s
                 LEFT JOIN ratings r ON s.id = r.store_id`;
    const values = [];
    let whereConditions = [];
    let paramCount = 1;

    if (filters.name) {
      whereConditions.push(`s.name ILIKE $${paramCount++}`);
      values.push(`%${filters.name}%`);
    }
    if (filters.email) {
      whereConditions.push(`s.email ILIKE $${paramCount++}`);
      values.push(`%${filters.email}%`);
    }
    if (filters.address) {
      whereConditions.push(`s.address ILIKE $${paramCount++}`);
      values.push(`%${filters.address}%`);
    }

    if (whereConditions.length > 0) {
      query += ' WHERE ' + whereConditions.join(' AND ');
    }

    query += ' GROUP BY s.id';

    if (sort.field) {
      const validFields = ['name', 'email', 'address', 'average_rating'];
      if (validFields.includes(sort.field)) {
        query += ` ORDER BY ${sort.field} ${sort.direction === 'desc' ? 'DESC' : 'ASC'}`;
      }
    }

    const result = await pool.query(query, values);
    return result.rows;
  },

  create: async (name, email, address, ownerId) => {
    const result = await pool.query(
      `INSERT INTO stores (name, email, address, owner_id) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, name, email, address, owner_id`,
      [name, email, address, ownerId]
    );
    return result.rows[0];
  },

  update: async (storeId, fields = {}) => {
    const allowed = ['name', 'email', 'address', 'owner_id'];
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

    values.push(storeId);
    const query = `UPDATE stores SET ${setClauses.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${idx} RETURNING id, name, email, address, owner_id`;
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  delete: async (storeId) => {
    const result = await pool.query('DELETE FROM stores WHERE id = $1 RETURNING id', [storeId]);
    return result.rows[0];
  },

  getStoresByOwner: async (ownerId) => {
    const result = await pool.query(
      `SELECT id FROM stores WHERE owner_id = $1`,
      [ownerId]
    );
    return result.rows;
  }
};

module.exports = { Store };
