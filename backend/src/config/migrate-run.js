// backend/src/config/migrate-run.js
require('dotenv').config();
const path = require('path');

function tryRequire(paths) {
  for (const p of paths) {
    try {
      const full = path.resolve(__dirname, p);
      require.resolve(full);
      const mod = require(full);
      console.log(`✔ Loaded module from ${p}`);
      return { path: p, mod };
    } catch (err) {
      // ignore and try next
    }
  }
  return null;
}

const schemaCandidate = tryRequire(['./schema', '../config/schema', '../../config/schema', '../schema', './config/schema']);
const dbCandidate = tryRequire(['./database', '../config/database', '../../config/database', '../database', './config/database']);

if (!schemaCandidate && !dbCandidate) {
  console.error('Could not load schema or database modules from tried paths.');
  process.exit(1);
}

const schemaMod = schemaCandidate ? schemaCandidate.mod : null;
const dbMod = dbCandidate ? dbCandidate.mod : null;

console.log('schema exports:', schemaMod ? Object.keys(schemaMod) : 'none');
console.log('database exports:', dbMod ? Object.keys(dbMod) : 'none');

// Determine available functions
const runMigrations = (schemaMod && typeof schemaMod.runMigrations === 'function') ? schemaMod.runMigrations : null;
const schemaInit = (schemaMod && typeof schemaMod.initializeDatabase === 'function') ? schemaMod.initializeDatabase : null;

const dbInit = (dbMod && typeof dbMod.initializeDatabase === 'function') ? dbMod.initializeDatabase : null;
// if dbMod is a Pool instance (pg Pool), it won't have initializeDatabase; that's fine
const possiblePool = (dbMod && typeof dbMod.end === 'function') ? dbMod : (dbMod && dbMod.pool && typeof dbMod.pool.end === 'function' ? dbMod.pool : null);

async function closePool() {
  try {
    if (possiblePool && typeof possiblePool.end === 'function') {
      await possiblePool.end();
      console.log('Closed DB pool.');
    } else if (dbMod && dbMod.pool && typeof dbMod.pool.end === 'function') {
      await dbMod.pool.end();
      console.log('Closed DB pool (dbMod.pool).');
    }
  } catch (e) {
    console.warn('Error closing pool:', e && e.stack ? e.stack : e);
  }
}

(async () => {
  try {
    console.log('Migration-run starting...');

    // Run migrations if present
    if (runMigrations) {
      console.log('Running runMigrations() from schema module...');
      await runMigrations();
      console.log('runMigrations() finished.');
    } else {
      console.log('No runMigrations() found.');
    }

    // Decide which initializeDatabase to call:
    // priority: schemaMod.initializeDatabase -> dbMod.initializeDatabase
    const initialize = schemaInit || dbInit || null;
    if (initialize) {
      const seedFlag = (process.env.SEED_DB || (process.env.NODE_ENV !== 'production' ? 'true' : 'false')).toLowerCase();
      if (seedFlag === 'true') {
        console.log('Running initializeDatabase() to seed data...');
        await initialize();
        console.log('initializeDatabase() finished.');
      } else {
        console.log(`SEED_DB is '${seedFlag}' — skipping initializeDatabase()`);
      }
    } else {
      console.log('No initializeDatabase() found in schema or database modules.');
    }

    await closePool();
    console.log('Migration-run completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Migration-run failed:');
    console.error(err && err.stack ? err.stack : err);
    await closePool();
    process.exit(1);
  }
})();
