import { supabase } from "@/lib/supabase";

export async function checkLogin(username: string, password: string) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("username", username)
    .eq("password", password) // nanti pakai hash
    .single();

  if (error || !data) {
    return null;
  }

  // simpan session ke sessionStorage
  if (typeof window !== "undefined") {
    sessionStorage.setItem("isLoggedIn", "true");
    sessionStorage.setItem("username", data.username);
    sessionStorage.setItem("role", data.role);
    sessionStorage.setItem("user_id", data.id);
  }

  return data.role;
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
