import { db } from '@/lib/db';

export async function POST() {
  try {
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
      message: 'Admin user created successfully',
      userId: (result as any).insertId 
    });
  } catch (error) {
    console.error('Error creating admin user:', error);
    return Response.json({ 
      success: false, 
      message: 'Failed to create admin user',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
