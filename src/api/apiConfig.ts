const PUBLIC_API_BASE_URL = import.meta.env["VITE_API_BASE_URL"];

export function getPublicApiBaseUrl() {
  return PUBLIC_API_BASE_URL;
}

export function getApiBaseUrl() {
  if (typeof window === "undefined") {
    return process.env["SERVER_API_BASE_URL"] ?? PUBLIC_API_BASE_URL;
  }

  return PUBLIC_API_BASE_URL;
}
