// Enregistre une visite en y ajoutant la ville, fournie par le reseau Vercel.
// L'adresse IP n'est ni stockee ni transmise, seule la ville est conservee.

const SB = 'https://bxdnxnwbslykpgfsdltg.supabase.co';
const KEY = 'sb_publishable_gG8DLCGoOZ1fUBBx566k1w_BlW-eZth';

function propre(v) {
  if (!v) return null;
  try { return decodeURIComponent(v); } catch (e) { return v; }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ erreur: 'methode non autorisee' });
    return;
  }

  let corps = req.body;
  if (typeof corps === 'string') {
    try { corps = JSON.parse(corps); } catch (e) { corps = {}; }
  }
  corps = corps || {};

  const h = req.headers;

  // IP tronquee : on efface le dernier bloc (IPv4) ou la moitie basse (IPv6).
  // L'adresse complete n'est jamais stockee ni transmise.
  const brute = String(h['x-forwarded-for'] || '').split(',')[0].trim();
  let ipT = null;
  if (brute.includes('.')) {
    const p4 = brute.split('.');
    if (p4.length === 4) ipT = p4[0] + '.' + p4[1] + '.' + p4[2] + '.x';
  } else if (brute.includes(':')) {
    ipT = brute.split(':').slice(0, 3).join(':') + ':...';
  }

  const ligne = {
    evenement: String(corps.evenement || 'vue').slice(0, 40),
    chemin: String(corps.chemin || '/').slice(0, 200),
    session_id: String(corps.session_id || '').slice(0, 60),
    visiteur_id: String(corps.visiteur_id || '').slice(0, 60),
    appareil: String(corps.appareil || '').slice(0, 30),
    referent: String(corps.referent || '').slice(0, 120),
    ville: propre(h['x-vercel-ip-city']) || null,
    region: propre(h['x-vercel-ip-country-region']) || null,
    pays: propre(h['x-vercel-ip-country']) || String(corps.pays || '').slice(0, 60) || null,
    ip_tronquee: ipT,
    duree_s: Number.isFinite(+corps.duree_s) ? Math.round(+corps.duree_s) : null
  };

  try {
    const r = await fetch(SB + '/rest/v1/eeml_visites', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: KEY,
        Authorization: 'Bearer ' + KEY,
        Prefer: 'return=minimal'
      },
      body: JSON.stringify(ligne)
    });
    res.status(r.ok ? 204 : 502).end();
  } catch (e) {
    res.status(502).end();
  }
}
