const mysql = require("mysql2/promise");

const dbConfig = {
  host: process.env.DB_HOST || "pt-nikkatsu.com",
  user: process.env.DB_USER || "flutter",
  password: process.env.DB_PASSWORD || "flutter12345",
  database: process.env.DB_NAME || "partlist",
  port: Number(process.env.DB_PORT || 3306),
};

async function addColumnIfMissing(
  connection,
  tableName,
  columnDefinition,
  columnName,
) {
  try {
    await connection.execute(
      `ALTER TABLE ${tableName} ADD COLUMN ${columnDefinition}`,
    );
    console.log(`Column ${columnName} added successfully to ${tableName}`);
  } catch (error) {
    if (error.code === "ER_DUP_FIELDNAME" || error.code === "ER_DUP_KEYNAME") {
      console.log(`Column ${columnName} already exists in ${tableName}`);
    } else {
      throw error;
    }
  }
}

async function ensurePartlistTables() {
  let connection;

  try {
    connection = await mysql.createConnection(dbConfig);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS partlist_produk (
        id INT AUTO_INCREMENT PRIMARY KEY,
        noprod VARCHAR(50) NOT NULL,
        produk_name VARCHAR(255) NOT NULL,
        satuan VARCHAR(20) NOT NULL DEFAULT 'PCS',
        user_id VARCHAR(100) DEFAULT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS partlist_produk_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        produk_id INT NOT NULL,
        item_no INT NOT NULL DEFAULT 0,
        code VARCHAR(100) DEFAULT '',
        nama_bahan VARCHAR(255) DEFAULT '',
        spesifikasi VARCHAR(255) DEFAULT '',
        keterangan TEXT DEFAULT '',
        pakai_pc VARCHAR(50) DEFAULT '',
        unit VARCHAR(50) DEFAULT '',
        BDOWN VARCHAR(50) DEFAULT '',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_partlist_produk_items_produk
          FOREIGN KEY (produk_id) REFERENCES partlist_produk(id)
          ON DELETE CASCADE
          ON UPDATE CASCADE
      )
    `);

    await addColumnIfMissing(
      connection,
      "partlist_produk",
      "noprod VARCHAR(50) NOT NULL",
      "noprod",
    );
    await addColumnIfMissing(
      connection,
      "partlist_produk",
      "produk_name VARCHAR(255) NOT NULL",
      "produk_name",
    );
    await addColumnIfMissing(
      connection,
      "partlist_produk",
      'satuan VARCHAR(20) NOT NULL DEFAULT "PCS"',
      "satuan",
    );
    await addColumnIfMissing(
      connection,
      "partlist_produk",
      "user_id VARCHAR(100) DEFAULT NULL",
      "user_id",
    );
    await addColumnIfMissing(
      connection,
      "partlist_produk",
      "created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP",
      "created_at",
    );
    await addColumnIfMissing(
      connection,
      "partlist_produk",
      "updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP",
      "updated_at",
    );

    await addColumnIfMissing(
      connection,
      "partlist_produk_items",
      "produk_id INT NOT NULL",
      "produk_id",
    );
    await addColumnIfMissing(
      connection,
      "partlist_produk_items",
      "item_no INT NOT NULL DEFAULT 0",
      "item_no",
    );
    await addColumnIfMissing(
      connection,
      "partlist_produk_items",
      'code VARCHAR(100) DEFAULT ""',
      "code",
    );
    await addColumnIfMissing(
      connection,
      "partlist_produk_items",
      'nama_bahan VARCHAR(255) DEFAULT ""',
      "nama_bahan",
    );
    await addColumnIfMissing(
      connection,
      "partlist_produk_items",
      'spesifikasi VARCHAR(255) DEFAULT ""',
      "spesifikasi",
    );
    await addColumnIfMissing(
      connection,
      "partlist_produk_items",
      'keterangan TEXT DEFAULT ""',
      "keterangan",
    );
    await addColumnIfMissing(
      connection,
      "partlist_produk_items",
      'pakai_pc VARCHAR(50) DEFAULT ""',
      "pakai_pc",
    );
    await addColumnIfMissing(
      connection,
      "partlist_produk_items",
      'unit VARCHAR(50) DEFAULT ""',
      "unit",
    );
    await addColumnIfMissing(
      connection,
      "partlist_produk_items",
      'BDOWN VARCHAR(50) DEFAULT ""',
      "BDOWN",
    );
    await addColumnIfMissing(
      connection,
      "partlist_produk_items",
      "created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP",
      "created_at",
    );

    console.log("Partlist tables ensured successfully");
  } catch (error) {
    console.error("Error ensuring partlist tables:", error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

ensurePartlistTables();
