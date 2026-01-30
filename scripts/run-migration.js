const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: 'pt-nikkatsu.com',
  user: 'flutter',
  password: 'flutter12345',
  database: 'partlist',
  port: 3306,
};

async function runMigration() {
  let connection;
  
  try {
    console.log('Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    
    console.log('Running migration: Add BDOWN column to partlist_produk_items');
    
    // Check if column already exists
    const [columns] = await connection.execute(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = 'partlist' 
       AND TABLE_NAME = 'partlist_produk_items' 
       AND COLUMN_NAME = 'BDOWN'`
    );
    
    if (columns.length > 0) {
      console.log('Column BDOWN already exists in partlist_produk_items table');
      return;
    }
    
    // Add BDOWN column
    await connection.execute(
      'ALTER TABLE partlist_produk_items ADD COLUMN BDOWN VARCHAR(50) DEFAULT \'\' AFTER unit'
    );
    
    console.log('✅ Migration completed successfully!');
    console.log('Column BDOWN has been added to partlist_produk_items table');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed');
    }
  }
}

runMigration();
