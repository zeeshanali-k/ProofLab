const API_BASE_URL = (process.env.NEXT_PUBLIC_PROOFLAB_API_URL || 'http://localhost:8000').replace(/\/+$/, '');

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, { credentials: 'include', ...options });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || body.detail || 'LeetMath is unavailable right now.');
  return body;
}

export const LeetMathService = {
  fetchCatalog() {
    return request('/challenges');
  },

  fetchProgress() {
    return request('/challenges/progress');
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

  submit(challengeId, latex) {
    return request(`/challenges/${encodeURIComponent(challengeId)}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ latex }),
    });
  },

  fetchSubmissions(challengeId) {
    return request(`/challenges/${encodeURIComponent(challengeId)}/submissions`);
  },
};
