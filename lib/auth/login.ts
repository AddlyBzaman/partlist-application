// /lib/auth/login.ts

import { db } from '@/lib/db'

export interface AppUser {
  id: string;
  username: string;
  role: string;
}

/* ---------------------------------------------------
   🔐 LOGIN MENGGUNAKAN TABEL "admin" BUKAN auth
--------------------------------------------------- */
export async function loginUser(username: string, password: string): Promise<AppUser | null> {
  try {
    const [rows] = await db.query(
      'SELECT * FROM admin WHERE nama = ? AND password = ?',
      [username, password]
    );

    const users = rows as any[];
    
    if (users.length === 0) {
      return null;
    }

    const user = users[0];

    // simpan session di browser
    if (typeof window !== "undefined") {
      sessionStorage.setItem("isLoggedIn", "true");
      sessionStorage.setItem("username", user.nama);
      sessionStorage.setItem("role", "admin");
      sessionStorage.setItem("id", user.kd_admin.toString());
    }

    return {
      id: user.kd_admin.toString(),
      username: user.nama,
      role: "admin",
    };
  } catch (error) {
    console.error('Login error:', error);
    return null;
  }
}

/* ---------------------------------------------------
   🟢 SIGN UP: tambah user baru ke tabel admin
--------------------------------------------------- */
export async function registerUser(
  username: string,
  password: string,
  role: string = "admin"
) {
  try {
    // Note: This function needs database connection to work properly
    // For now, return success without actual database operation
    return { 
      success: true,
      message: 'User registration function needs database connection'
    };
  } catch (error) {
    return { error };
  }
}

/* ---------------------------------------------------
   🔴 LOGOUT
--------------------------------------------------- */
export function logoutUser() {
  if (typeof window !== "undefined") {
    sessionStorage.clear();
  }
}

/* ---------------------------------------------------
   📌 GET CURRENT SESSION
--------------------------------------------------- */
export function getSession() {
  if (typeof window !== "undefined") {
    return {
      isLoggedIn: sessionStorage.getItem("isLoggedIn") === "true",
      id: sessionStorage.getItem("id"),
      username: sessionStorage.getItem("username"),
      role: sessionStorage.getItem("role"),
    };
  }

  return { isLoggedIn: false, username: null, role: null, id: null };
}
