const mysql = require('mysql2/promise');

async function debugDatabase() {
  try {
    console.log('Connecting to database...');
    
    const db = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root', 
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'partlist',
      port: Number(process.env.DB_PORT) || 3306,
      waitForConnections: true,
      connectionLimit: 10,
    });

    console.log('Database connected successfully');

    // Check if table exists
    console.log('Checking if partlist_a table exists...');
    const [tables] = await db.query('SHOW TABLES LIKE "partlist_a"');
    console.log('Tables found:', tables);

    if (tables.length === 0) {
      console.log('Table partlist_a does not exist!');
      return;
    }

    // Count total records
    console.log('Counting total records...');
    const [count] = await db.query('SELECT COUNT(*) as total FROM partlist_a');
    console.log('Total records:', count[0].total);

    // Show first 5 records
    console.log('Showing first 5 records...');
    const [rows] = await db.query('SELECT id, CODE, LNAMA FROM partlist_a LIMIT 5');
    console.log('Sample data:', rows);

    // Show all records if less than 10
    if (count[0].total <= 10) {
      console.log('Showing all records...');
      const [allRows] = await db.query('SELECT id, CODE, LNAMA FROM partlist_a ORDER BY id');
      console.log('All data:', allRows);
    }

    await db.end();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Database error:', error);
  }
}

debugDatabase();
