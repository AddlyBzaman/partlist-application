const mysql = require("mysql2/promise");

async function createDraftTable() {
  let connection;

  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "pt-nikkatsu.com",
      user: process.env.DB_USER || "flutter",
      password: process.env.DB_PASSWORD || "flutter12345",
      database: process.env.DB_NAME || "partlist",
      port: Number(process.env.DB_PORT || 3306),
    });

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS partlist_drafts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(100) NOT NULL,
        draft_data LONGTEXT NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_draft (user_id)
      )
    `);

    console.log("Draft table created or already exists");
  } catch (error) {
    console.error("Error creating draft table:", error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

createDraftTable();
