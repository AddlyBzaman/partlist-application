// lib/auth.ts

// Data user dummy (di production gunakan database)
const users = [
  {
    username: "admin",
    password: "admin123",
    role: "admin"
  },
  {
    username: "superadmin",
    password: "super123",
    role: "superadmin"
  }
];

export async function checkLogin(username: string, password: string): Promise<string | null> {
  // Simulasi delay untuk API call
  await new Promise(resolve => setTimeout(resolve, 500));

  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (user) {
    // Simpan session (di production gunakan JWT atau session management yang proper)
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('isLoggedIn', 'true');
      sessionStorage.setItem('username', user.username);
      sessionStorage.setItem('role', user.role);
    }
    return user.role;
  }

  return null;
}

export function logout() {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('role');
  }
}

export function getSession() {
  if (typeof window !== 'undefined') {
    return {
      isLoggedIn: sessionStorage.getItem('isLoggedIn') === 'true',
      username: sessionStorage.getItem('username'),
      role: sessionStorage.getItem('role')
    };
  }
  return {
    isLoggedIn: false,
    username: null,
    role: null
  };
}