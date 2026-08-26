import { getApiBaseUrl } from "./apiConfig";

export interface AuthUser {
  email: string;
}

export interface LoginResponse {
  token: string;
  email: string;
  expiresAt: number;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const response = await fetch(`${getApiBaseUrl()}/Auth/login`, {
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
  const response = await fetch(`${getApiBaseUrl()}/Auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error("Session expired.");
  }

  return response.json();
}
