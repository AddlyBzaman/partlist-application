const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: 'pt-nikkatsu.com',
  user: 'flutter',
  password: 'flutter12345',
  database: 'partlist',
  port: 3306,
};

async function updateExistingBDOWN() {
  let connection;
  
  try {
    console.log('Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    
    console.log('Fetching existing partlist_produk_items with empty BDOWN...');
    
    // Get all items with empty BDOWN
    const [items] = await connection.execute(
      `SELECT id, produk_id, code FROM partlist_produk_items 
       WHERE BDOWN = '' OR BDOWN IS NULL 
       AND code != '' 
       ORDER BY id DESC`
    );
    
    console.log(`Found ${items.length} items to update`);
    
    if (items.length === 0) {
      console.log('No items need updating');
      return;
    }
    
    let updatedCount = 0;
    
    // Update each item
    for (const item of items) {
      // Fetch BDOWN from partlist_a
      const [bahanRows] = await connection.execute(
        'SELECT BDOWN FROM partlist_a WHERE CODE = ? LIMIT 1',
        [item.code]
      );
      
      const bahanData = bahanRows;
      if (bahanData.length > 0) {
        const bdownValue = bahanData[0].BDOWN || '';
        
        // Update the item
        await connection.execute(
          'UPDATE partlist_produk_items SET BDOWN = ? WHERE id = ?',
          [bdownValue, item.id]
        );
        
        updatedCount++;
        console.log(`Updated item ${item.id}: ${item.code} -> BDOWN: "${bdownValue}"`);
      } else {
        console.log(`No BDOWN found for code: ${item.code}`);
      }
    }
    
    console.log(`✅ Update completed! Updated ${updatedCount} items`);
    
  } catch (error) {
    console.error('❌ Update failed:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed');
    }
  }
}

updateExistingBDOWN();
