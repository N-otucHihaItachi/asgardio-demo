const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const jwksRsa = require('jwks-rsa');
// chatStore removed for portfolio-focused repo

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 4000;
const ASGARDIO_DOMAIN = process.env.ASGARDIO_DOMAIN || 'https://api.asgardeo.io/t/org02fl3';

console.log('Using ASGARDIO_DOMAIN =', ASGARDIO_DOMAIN);

// Configure JWKS client (will be used to fetch signing keys)
const jwksClient = jwksRsa({ jwksUri: `${ASGARDIO_DOMAIN}/oauth2/jwks` });

async function verifyToken(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Missing Authorization header' });

  const parts = auth.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ error: 'Invalid Authorization header format' });
  }

  const token = parts[1];
  try {
    const decoded = jwt.decode(token, { complete: true });
    if (!decoded) return res.status(401).json({ error: 'Invalid token format' });

    const kid = decoded.header && decoded.header.kid;
    if (!kid) return res.status(401).json({ error: 'Token missing kid header' });

    // get signing key from JWKS
    const key = await jwksClient.getSigningKey(kid);
    const signingKey = key.getPublicKey ? key.getPublicKey() : (key.rsaPublicKey || key.publicKey);

    // Verify token signature and validity (RS256 expected)
    const payload = jwt.verify(token, signingKey, { algorithms: ['RS256'] });
    req.user = payload;
    next();
  } catch (e) {
    console.error('Token verification failed:', e && e.message ? e.message : e);
    return res.status(401).json({ error: 'Invalid or expired token', detail: String(e) });
  }
}

// Legacy chat endpoints removed. This backend now focuses on auth proxy and token verification.

app.get('/', (req, res) => res.send('Chatbot backend running'));

// Proxy endpoint to fetch OIDC discovery metadata from Asgardio to avoid CORS issues
app.get('/auth/.well-known/openid-configuration', async (req, res) => {
  try {
    const url = `${ASGARDIO_DOMAIN}/oauth2/oidcdiscovery/.well-known/openid-configuration`;
    console.log('Proxying OIDC discovery request to', url);
    const resp = await fetch(url);
    const text = await resp.text().catch(() => '');
    if (!resp.ok) {
      console.error('OIDC discovery fetch failed:', resp.status, resp.statusText, text);
      return res.status(502).json({ error: 'Failed to fetch OIDC configuration', status: resp.status, statusText: resp.statusText, body: text.substring(0, 200) });
    }
    try {
      const data = JSON.parse(text);
      return res.json(data);
    } catch (e) {
      console.error('OIDC discovery returned non-JSON body:', text.substring(0, 400));
      return res.status(502).json({ error: 'OIDC discovery returned non-JSON', body: text.substring(0, 800) });
    }
  } catch (e) {
    console.error('Failed to fetch openid-configuration:', e.message || e);
    res.status(502).json({ error: 'Failed to fetch OIDC configuration', detail: String(e) });
  }
});

// Proxy endpoint to fetch JWKS (useful if frontend or other tools need it)
app.get('/auth/jwks', async (req, res) => {
  try {
    const url = `${ASGARDIO_DOMAIN}/oauth2/jwks`;
    console.log('Proxying JWKS request to', url);
    const resp = await fetch(url);
    const text = await resp.text().catch(() => '');
    if (!resp.ok) {
      console.error('JWKS fetch failed:', resp.status, resp.statusText, text);
      return res.status(502).json({ error: 'Failed to fetch JWKS', status: resp.status, statusText: resp.statusText, body: text.substring(0,200) });
    }
    try {
      const data = JSON.parse(text);
      return res.json(data);
    } catch (e) {
      console.error('JWKS returned non-JSON body:', text.substring(0,400));
      return res.status(502).json({ error: 'JWKS returned non-JSON', body: text.substring(0,800) });
    }
  } catch (e) {
    console.error('Failed to fetch jwks:', e.message || e);
    res.status(502).json({ error: 'Failed to fetch JWKS', detail: String(e) });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
