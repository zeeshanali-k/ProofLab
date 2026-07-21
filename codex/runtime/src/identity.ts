/** Server-only helpers for optional Sign in with ChatGPT. */

export const SITES_SIGN_IN_PATH = '/signin-with-chatgpt';
export const SITES_SIGN_OUT_PATH = '/signout-with-chatgpt';

export interface SitesIdentity {
  email: string;
  fullName: string | null;
}

function normalizedEmail(value: string): string | null {
  const email = value.trim().toLowerCase();
  return email.length > 0 && email.length <= 320 && email.includes('@') ? email : null;
}

/**
 * Only server routes may call this. The browser must never be trusted to send
 * these headers, nor should authorization depend on the optional name.
 */
export function identityFromRequest(request: Request): SitesIdentity | null {
  const email = normalizedEmail(request.headers.get('oai-authenticated-user-email') ?? '');
  if (!email) return null;

  const name = request.headers.get('oai-authenticated-user-full-name')?.trim() || null;
  return { email, fullName: name };
}

export function signInRequired(): Response {
  return Response.json(
    { error: 'Sign in with ChatGPT is required to access saved ProofLab progress.' },
    { status: 401 },
  );
}
