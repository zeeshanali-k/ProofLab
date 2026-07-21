// Reference client for the copied Sites frontend only.  It is intentionally
// not imported by the current app, which still targets the local FastAPI API.

const API_PREFIX = '/api';

export async function sitesRequest(path, options = {}) {
  const response = await fetch(`${API_PREFIX}${path}`, {
    credentials: 'include',
    ...options,
  });
  const body = response.status === 204 ? null : await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || body.detail || 'ProofLab could not complete that request.');
  return body;
}

export const SitesAuthService = {
  me: () => sitesRequest('/auth/me'),
  updateProfile: (payload) => sitesRequest('/me/profile', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }),
  signIn: () => { window.location.assign('/signin-with-chatgpt'); },
  signOut: () => { window.location.assign('/signout-with-chatgpt'); },
};
