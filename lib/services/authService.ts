import { query } from '../db-simple';

export async function checkLogin(username: string, password: string) {
  const users = await query(
    'SELECT * FROM admin WHERE nama = ? AND password = ?',
    [username, password]
  ) as any[];

  if (users.length === 0) {
    return null;
  }

  const user = users[0];

 
  if (typeof window !== "undefined") {
    sessionStorage.setItem("isLoggedIn", "true");
    sessionStorage.setItem("username", user.nama);
    sessionStorage.setItem("user_id", user.kd_admin.toString());
  }

  return "admin"; // default role
}

export function logout() {
  if (typeof window !== "undefined") {
    sessionStorage.clear();
  }
}

export function getSession() {
  if (typeof window !== "undefined") {
    return {
      isLoggedIn: sessionStorage.getItem("isLoggedIn") === "true",
      username: sessionStorage.getItem("username"),
      role: sessionStorage.getItem("role"),
      user_id: sessionStorage.getItem("user_id"),
    };
  }
  return { isLoggedIn: false, username: null, role: null, user_id: null };
}
