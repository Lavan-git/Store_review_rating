const pool = require('./database');

// Add comment column to ratings table if it doesn't exist
const runMigrations = async () => {
  try {
    // Check if comment column exists
    const checkColumn = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'ratings' AND column_name = 'comment'
    `);

    if (checkColumn.rows.length === 0) {
      console.log('Adding comment column to ratings table...');
      await pool.query(`
        ALTER TABLE ratings 
        ADD COLUMN comment VARCHAR(500)
      `);
      console.log('Migration completed: comment column added to ratings table');
    } else {
      console.log('Migration check: comment column already exists');
    }
  } catch (error) {
    console.error('Migration error:', error.message);
  }
};

module.exports = { runMigrations };
