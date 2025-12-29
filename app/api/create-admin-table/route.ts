import { db } from '@/lib/db';

export async function POST() {
  try {
    // Create admin table if it doesn't exist
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS admin (
        kd_admin INT AUTO_INCREMENT PRIMARY KEY,
        nama VARCHAR(60) NOT NULL,
        email VARCHAR(60) NOT NULL,
        password VARCHAR(60) NOT NULL,
        gambar VARCHAR(225)
      )
    `;
    
    await db.query(createTableSQL);

    // Check if admin user already exists
    const [existingRows] = await db.query('SELECT * FROM admin WHERE nama = ?', ['admin']);
    
    if (Array.isArray(existingRows) && existingRows.length > 0) {
      return Response.json({ 
        success: false, 
        message: 'Admin user already exists' 
      });
    }

    // Create admin user
    const [result] = await db.query(
      'INSERT INTO admin (nama, email, password, gambar) VALUES (?, ?, ?, ?)',
      ['admin', 'admin@partlist.com', 'admin111', '']
    );

    return Response.json({ 
      success: true, 
      message: 'Admin table created and user added successfully',
      userId: (result as any).insertId 
    });
  } catch (error) {
    console.error('Error creating admin table/user:', error);
    return Response.json({ 
      success: false, 
      message: 'Failed to create admin table/user',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
