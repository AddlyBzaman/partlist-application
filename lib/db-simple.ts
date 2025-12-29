// Simple database connection that avoids MySQL2 browser compatibility issues
let pool: any = null;

export async function getDbConnection() {
  if (pool) return pool;
  
  try {
    // Dynamic import to avoid bundling issues
    const mysql = await import('mysql2/promise');
    
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'partlist',
      port: Number(process.env.DB_PORT),
      waitForConnections: true,
      connectionLimit: 10,
    });
    
    return pool;
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
}

export async function query(sql: string, params?: any[]) {
  const db = await getDbConnection();
  try {
    const [rows] = await db.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
}
