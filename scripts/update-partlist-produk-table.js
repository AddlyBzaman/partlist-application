const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'pt-nikkatsu.com',
  user: 'flutter',
  password: 'flutter12345',
  database: 'partlist',
  port: 3306
};

async function updateTable() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // Add noprod column
    try {
      await connection.execute('ALTER TABLE partlist_produk ADD COLUMN noprod VARCHAR(50) AFTER id');
      console.log('Column noprod added successfully');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('Column noprod already exists');
      } else {
        throw error;
      }
    }
    
    // Add satuan column
    try {
      await connection.execute('ALTER TABLE partlist_produk ADD COLUMN satuan VARCHAR(20) DEFAULT "PCS" AFTER produk_name');
      console.log('Column satuan added successfully');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('Column satuan already exists');
      } else {
        throw error;
      }
    }
    
    await connection.end();
    console.log('Table update completed successfully');
    
  } catch (error) {
    console.error('Error updating table:', error);
  }
}

updateTable();
