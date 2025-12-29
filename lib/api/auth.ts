// API helper functions for authentication

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  role?: string;
}

export interface AuthResponse {
  success: boolean;
  user?: {
    id: string;
    username: string;
    role: string;
  };
  error?: string;
  message?: string;
}

export interface SessionResponse {
  success: boolean;
  session: {
    isLoggedIn: boolean;
    id: string | null;
    username: string | null;
    role: string | null;
  };
}

// Login function
export async function apiLogin(credentials: LoginRequest): Promise<AuthResponse> {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Login API error:', error);
    return {
      success: false,
      error: 'Terjadi kesalahan koneksi',
    };
  }
}

// Register function
export async function apiRegister(userData: RegisterRequest): Promise<AuthResponse> {
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Register API error:', error);
    return {
      success: false,
      error: 'Terjadi kesalahan koneksi',
    };
  }
}

// Logout function
export async function apiLogout(): Promise<{ success: boolean; error?: string; message?: string }> {
  try {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Logout API error:', error);
    return {
      success: false,
      error: 'Terjadi kesalahan koneksi',
    };
  }
}

// Get session function
export async function apiGetSession(): Promise<SessionResponse> {
  try {
    const response = await fetch('/api/auth/session', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Session API error:', error);
    return {
      success: false,
      session: {
        isLoggedIn: false,
        id: null,
        username: null,
        role: null,
      },
    };
  }
}
