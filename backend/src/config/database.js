// backend/src/config/database.js
require('dotenv').config();
const { Pool } = require('pg');

function isLocalHostConnection(conn) {
  if (!conn) return false;
  return /localhost|127\.0\.0\.1/.test(conn);
}

let pool;

if (process.env.DATABASE_URL) {
  const dbUrl = process.env.DATABASE_URL;
  const sslRequested = (process.env.PGSSLMODE && process.env.PGSSLMODE.toLowerCase() === 'require')
    || /sslmode=require/i.test(dbUrl)
    || (process.env.NODE_ENV === 'production' && !isLocalHostConnection(dbUrl));

  pool = new Pool({
    connectionString: dbUrl,
    ssl: sslRequested ? { rejectUnauthorized: false } : false
  });
} else {
  pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
    database: process.env.DB_NAME || 'store_rating_db'
  });
}

pool.on('connect', () => console.log('PG pool connected'));
pool.on('error', (err) => console.error('Unexpected error on idle client', err));

module.exports = pool;
