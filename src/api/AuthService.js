const API_BASE_URL = (process.env.NEXT_PUBLIC_PROOFLAB_API_URL || 'http://localhost:8000').replace(/\/+$/, '');

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    ...options,
  });
  const body = response.status === 204 ? null : await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || body.detail || 'ProofLab could not complete that request.');
  return body;
}

export const AuthService = {
  me: () => request('/auth/me'),
  login: (payload) => request('/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }),
  register: (payload) => request('/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  updateProfile: (payload) => request('/me/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }),
  dashboard: () => request('/me/dashboard'),
  introduceActivity: (payload) => request('/activities/introduce', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }),
};

export function safeReturnTo(candidate) {
  return candidate && candidate.startsWith('/') && !candidate.startsWith('//') ? candidate : '/dashboard';
}
