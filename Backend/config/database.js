const { Pool } = require('pg');
require('dotenv').config();

// PostgreSQL connection configuration
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'pgi_emrs',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  max: parseInt(process.env.DB_POOL_MAX) || 20, // Maximum number of clients in the pool
  idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE_TIMEOUT) || 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: parseInt(process.env.DB_POOL_CONNECTION_TIMEOUT) || 2000, // Return an error after 2 seconds if connection could not be established
});

// Handle pool errors
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Test database connection
async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    console.log('✅ Connected to PostgreSQL successfully');
    console.log('📅 Database time:', result.rows[0].now);
    return true;
  } catch (error) {
    console.error('❌ PostgreSQL connection error:', error.message);
    console.error('Check your database configuration in .env file');
    console.error('Required: DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD');
    return false;
  }
}

// Main query function - executes SQL queries directly
const query = async (text, params = []) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Query executed successfully', { 
      duration: `${duration}ms`, 
      rows: result.rowCount,
      command: result.command 
    });
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    console.error('Query:', text.substring(0, 200));
    console.error('Params:', params.slice(0, 5));
    throw error;
  }
};

// Get a client from the pool for transactions
const getClient = async () => {
  return await pool.connect();
};

// Initialize connection test on module load
testConnection();

module.exports = {
  query,
  getClient,
  pool,
  testConnection
};
