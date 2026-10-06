export const tokenKey = 'farmacia.jwt';

export async function api(url, options = {}) {
  const headers = new Headers(options.headers || {});
  const token = sessionStorage.getItem(tokenKey);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (options.body) headers.set('Content-Type', 'application/json');

  const response = await fetch(url, { ...options, headers });
  const body = response.status === 204 ? null : await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401 && token) {
      window.dispatchEvent(new CustomEvent('auth:expired'));
    }
    throw new Error(body?.error || 'No se pudo completar la solicitud.');
  }

  return body;
}

export async function login(credentials) {
  return api('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  });
}

export async function register(account) {
  return api('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(account)
  });
}

export function getSavedToken() {
  return sessionStorage.getItem(tokenKey);
}

export function saveToken(token) {
  sessionStorage.setItem(tokenKey, token);
}

export function clearToken() {
  sessionStorage.removeItem(tokenKey);
}
