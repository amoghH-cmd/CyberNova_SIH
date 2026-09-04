/* api.js — all fetch calls to the backend */

// In dev, Vite proxies '/api' to the local backend (see vite.config.js).
// In production, set VITE_API_URL to the deployed backend's origin.
const BASE = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '') + '/api';

async function get(path) {
  const res = await fetch(BASE + path);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

async function post(path, body) {
  const res = await fetch(BASE + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

async function patch(path, body) {
  const res = await fetch(BASE + path, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

/* Dashboard */
export const getDashboardSummary    = () => get('/dashboard/summary');
export const getDashboardLivePanels = () => get('/dashboard/live-panels');

/* Incidents */
export const getIncidents = (params = {}) => {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v !== '' && v !== null && v !== undefined) qs.set(k, v); });
  const q = qs.toString();
  return get('/incidents' + (q ? '?' + q : ''));
};
export const getIncident       = (id)     => get(`/incidents/${id}`);
export const getLatestThreat   = ()        => get('/incidents/latest-threat');
export const getIncidentTimeline = (id)   => get(`/incidents/${id}/timeline`);

export const submitFeedback    = (id, body) => post(`/incidents/${id}/feedback`, body);

/* Events */
export const getEvents = (params = {}) => {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v !== '' && v !== null && v !== undefined) qs.set(k, v); });
  const q = qs.toString();
  return get('/events' + (q ? '?' + q : ''));
};
export const simulateEvent = (body) => post('/events', body);
export const triggerRedTeamAttack = (attackType) => post(`/events/simulate/attack?attack_type=${attackType}`, {});
export const triggerSimulatedAttack = triggerRedTeamAttack;

/* Users */
export const getUsers = ()           => get('/users');
export const getUser  = (username)   => get(`/users/${username}`);
export const registerUser = (body)   => post('/users/register', body);
export const loginUser    = (body)   => post('/users/login', body);

/* Multi-Modal Security Hub */
export const scanPhishingUrl = (url) => post('/multimodal/phishing', { url });
export const scanScamMessage = (text, channel = 'SMS') => post('/multimodal/scam', { text, channel });
export const scanDeepfakeMedia = async (formData) => {
  const res = await fetch(BASE + '/multimodal/deepfake', {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
};

/* SOAR Playbooks & Automation */
export const getSoarPolicies = () => get('/soar/policies');
export const createSoarPolicy = (body) => post('/soar/policies', body);
export const toggleSoarPolicy = (id, enabled) => patch(`/soar/policies/${id}`, { enabled });
export const getSoarLogs = () => get('/soar/logs');

/* AI SOC Co-Pilot (CyberNova Sentinel) */
export const queryCopilot = (query) => post('/copilot/query', { query });
export const investigateWithCopilot = (incidentId) => get(`/copilot/investigate/${incidentId}`);

/* Cyber Knowledge Base */
export const getKnowledgeCategories = () => get('/knowledge/categories');
export const getKnowledgeCategory = (slug) => get(`/knowledge/category/${slug}`);
export const getKnowledgeArticles = (params = {}) => {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v !== '' && v !== null && v !== undefined) qs.set(k, v); });
  const q = qs.toString();
  return get('/knowledge/articles' + (q ? '?' + q : ''));
};
export const getKnowledgeArticle = (slug) => get(`/knowledge/article/${slug}`);

