// Thin wrappers around the 5 Nexus Estate n8n webhooks.
// All endpoints are POST + JSON. n8n must send CORS headers for the GH Pages origin.

const BASE = import.meta.env.VITE_N8N_BASE || 'https://n8n.srv1609042.hstgr.cloud';

async function post(path, body) {
  const res = await fetch(`${BASE}/webhook/${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let json;
  try { json = text ? JSON.parse(text) : null; } catch { json = { raw: text }; }
  if (!res.ok) {
    const err = new Error(`Nexus ${path} → ${res.status}`);
    err.payload = json;
    throw err;
  }
  return json;
}

export const nexus = {
  sellerIntake: (payload) => post('nexus/seller-intake', payload),
  buyerIntake: (payload) => post('nexus/buyer-intake', payload),
  analyzeDeal: (payload) => post('nexus/analyze-deal', payload),
  outreach: (sellerId) => post('nexus/outreach', { seller_id: sellerId }),
  contract: (payload) => post('nexus/contract', payload),
};
