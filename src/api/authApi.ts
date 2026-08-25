const API_BASE_URL = import.meta.env["VITE_API_BASE_URL"];

export interface AuthUser {
  email: string;
}

export interface LoginResponse {
  token: string;
  email: string;
  expiresAt: number;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/Auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error("Invalid email or password.");
  }

  return response.json();
}

export async function getCurrentUser(token: string): Promise<AuthUser> {
  const response = await fetch(`${API_BASE_URL}/Auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error("Session expired.");
  }

  return response.json();
}
