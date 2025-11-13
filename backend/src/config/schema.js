const pool = require('./database');
const bcrypt = require('bcryptjs');

// Create all tables
const initializeDatabase = async () => {
  try {
    // Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(60) NOT NULL CHECK (length(name) >= 20 AND length(name) <= 60),
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        address VARCHAR(400) CHECK (length(address) <= 400),
        role VARCHAR(20) NOT NULL DEFAULT 'normal_user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Stores table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS stores (
        id SERIAL PRIMARY KEY,
        name VARCHAR(60) NOT NULL CHECK (length(name) >= 20 AND length(name) <= 60),
        email VARCHAR(255) UNIQUE NOT NULL,
        address VARCHAR(400) NOT NULL CHECK (length(address) <= 400),
        owner_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // Ratings table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ratings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        store_id INTEGER NOT NULL,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
        UNIQUE(user_id, store_id)
      );
    `);

    console.log('Database tables created successfully');

    // Password resets table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS password_resets (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        token VARCHAR(255) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    // Seed sample data: 3 users per role (admin, normal_user, store_owner)
    try {
      const seedPassword = 'TestPass123!';
      const hashed = await bcrypt.hash(seedPassword, 10);

      const roles = ['admin', 'normal_user', 'store_owner'];

      for (const role of roles) {
        for (let i = 1; i <= 3; i++) {
          const email = `${role}${i}@example.com`;
          // Check if user exists
          const res = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
          if (res.rows.length === 0) {
            // Ensure name length between 20 and 60 chars
            const name = `${role.replace('_', ' ')} sample user ${i}   `; // padded to meet min length
            const address = `Seed address for ${email}`;
            await pool.query(
              `INSERT INTO users (name, email, password, address, role) VALUES ($1, $2, $3, $4, $5)`,
              [name.substring(0, 60), email, hashed, address.substring(0, 400), role]
            );
            console.log(`Seeded user: ${email} (${role})`);
          }
        }
      }

      // Create one store per store_owner (if not exists) and one sample rating
      const owners = await pool.query("SELECT id, email FROM users WHERE role = 'store_owner'");
      const normal = await pool.query("SELECT id, email FROM users WHERE role = 'normal_user' ORDER BY id LIMIT 1");
      const normalUserId = normal.rows[0] ? normal.rows[0].id : null;

      for (let idx = 0; idx < owners.rows.length; idx++) {
        const owner = owners.rows[idx];
        const storeEmail = `store${idx + 1}@example.com`;
        const storeCheck = await pool.query('SELECT id FROM stores WHERE email = $1', [storeEmail]);
        let storeId;
        if (storeCheck.rows.length === 0) {
          const storeName = `Sample Store for ${owner.email} ${idx + 1}   `; // ensure min length
          const storeAddress = `123 Sample St - ${owner.email}`;
          const insertStore = await pool.query(
            `INSERT INTO stores (name, email, address, owner_id) VALUES ($1, $2, $3, $4) RETURNING id`,
            [storeName.substring(0, 60), storeEmail, storeAddress.substring(0, 400), owner.id]
          );
          storeId = insertStore.rows[0].id;
          console.log(`Seeded store: ${storeEmail} (owner: ${owner.email})`);
        } else {
          storeId = storeCheck.rows[0].id;
        }

        // Add a sample rating from the first normal user if not exists
        if (normalUserId) {
          const ratingCheck = await pool.query('SELECT id FROM ratings WHERE user_id = $1 AND store_id = $2', [normalUserId, storeId]);
          if (ratingCheck.rows.length === 0) {
            const ratingValue = (idx % 5) + 1; // 1..5
            await pool.query('INSERT INTO ratings (user_id, store_id, rating) VALUES ($1, $2, $3)', [normalUserId, storeId, ratingValue]);
            console.log(`Seeded rating for store ${storeEmail} by user id ${normalUserId}`);
          }
        }
      }
    } catch (seedErr) {
      console.error('Error seeding sample data:', seedErr);
    }
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

module.exports = { initializeDatabase };
