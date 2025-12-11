// /lib/auth/login.ts

import { supabase } from "@/lib/supabase";

export interface AppUser {
  id: string;
  username: string;
  role: string;
}

/* ---------------------------------------------------
   🔐 LOGIN MENGGUNAKAN TABEL "users" BUKAN auth
--------------------------------------------------- */
export async function loginUser(username: string, password: string): Promise<AppUser | null> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("username", username)
    .eq("password", password)
    .single();

  if (error || !data) {
    return null;
  }

  // simpan session di browser
  if (typeof window !== "undefined") {
    sessionStorage.setItem("isLoggedIn", "true");
    sessionStorage.setItem("username", data.username);
    sessionStorage.setItem("role", data.role);
    sessionStorage.setItem("id", data.id);
  }

  return {
    id: data.id,
    username: data.username,
    role: data.role,
  };
}

/* ---------------------------------------------------
   🟢 SIGN UP: tambah user baru ke tabel users
--------------------------------------------------- */
export async function registerUser(
  username: string,
  password: string,
  role: string = "admin"
) {
  const { data, error } = await supabase
    .from("users")
    .insert([{ username, password, role }])
    .select()
    .single();

  if (error) return { error };
  return { data };
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
