const API_BASE_URL = (process.env.NEXT_PUBLIC_PROOFLAB_API_URL || 'http://localhost:8000').replace(/\/+$/, '');

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, { credentials: 'include', ...options });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || body.detail || 'The Foundations lab is unavailable right now.');
  return body;
}

function post(path, payload) {
  return request(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
}

export const FoundationService = {
  async catalog() {
    const catalog = await request('/curriculum');
    return catalog.nodes.filter((node) => node.parentId === 'foundations.quantitative-reasoning');
  },
  next(templateId, restart = false) {
    return post('/practice/next', { templateId, restart });
  },
  get(instanceId) {
    return request(`/practice/${encodeURIComponent(instanceId)}`);
  },
  verify(instanceId, response) {
    return post(`/practice/${encodeURIComponent(instanceId)}/verify`, { response });
  },
  submit(instanceId, response) {
    return post(`/practice/${encodeURIComponent(instanceId)}/submit`, { response });
  },
};
