const API_BASE_URL = (process.env.NEXT_PUBLIC_PROOFLAB_API_URL || 'http://127.0.0.1:8000').replace(/\/+$/, '');
const SUBMISSION_SESSION_KEY = 'prooflab:leetmath:submission-session-id';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, options);
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || body.detail || 'LeetMath is unavailable right now.');
  return body;
}

export function getSubmissionSessionId() {
  if (typeof window === 'undefined') return null;

  const existing = window.localStorage.getItem(SUBMISSION_SESSION_KEY);
  if (existing) return existing;

  const sessionId = window.crypto.randomUUID();
  window.localStorage.setItem(SUBMISSION_SESSION_KEY, sessionId);
  return sessionId;
}

export const LeetMathService = {
  fetchCatalog() {
    return request('/challenges');
  },

  fetchChallenge(challengeId) {
    return request(`/challenges/${encodeURIComponent(challengeId)}`);
  },

  preview(challengeId, latex) {
    return request(`/challenges/${encodeURIComponent(challengeId)}/preview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ latex }),
    });
  },

  submit(challengeId, latex, anonymousSessionId) {
    return request(`/challenges/${encodeURIComponent(challengeId)}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ latex, anonymousSessionId }),
    });
  },

  fetchSubmissions(challengeId, anonymousSessionId) {
    return request(`/challenges/${encodeURIComponent(challengeId)}/submissions`, {
      headers: { 'X-ProofLab-Session': anonymousSessionId },
    });
  },
};
