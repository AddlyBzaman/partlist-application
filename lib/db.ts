import mysql from 'mysql2/promise';

// Check if environment variables are available
const dbConfig = {
  host: process.env.DB_HOST || 'pt-nikkatsu.com',
  user: process.env.DB_USER || 'flutter',
  password: process.env.DB_PASSWORD || 'flutter12345',
  database: process.env.DB_NAME || 'partlist',
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
};

console.log('Database config:', {
  ...dbConfig,
  password: dbConfig.password ? '[REDACTED]' : '[EMPTY]'
});

export const db = mysql.createPool(dbConfig);
