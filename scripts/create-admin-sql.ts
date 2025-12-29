import mysql from 'mysql2/promise';

async function createAdminUser() {
  let connection;
  try {
    // Create database connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'partlist',
      port: Number(process.env.DB_PORT),
    });

    // Check if admin user already exists
    const [existingRows] = await connection.execute(
      'SELECT * FROM admin WHERE nama = ?',
      ['admin']
    );

    if ((existingRows as any[]).length > 0) {
      console.log('Admin user already exists');
      return;
    }

    // Create admin user
    const [result] = await connection.execute(
      `INSERT INTO admin (nama, email, password, gambar) VALUES (?, ?, ?, ?)`,
      ['admin', 'admin@partlist.com', 'admin111', '']
    );

    console.log('Admin user created successfully with ID:', (result as any).insertId);
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

createAdminUser();
