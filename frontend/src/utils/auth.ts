// Simple auth helper for the frontend
// Retrieves the JWT token stored in localStorage (or sessionStorage)
export function getToken(): string | null {
  const token =
    localStorage.getItem('token') ??
    localStorage.getItem('accessToken') ??
    sessionStorage.getItem('accessToken');
  return token;
}
