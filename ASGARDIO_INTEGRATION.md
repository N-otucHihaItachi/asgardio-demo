# WSO2 Asgardio Integration (Overview)

This document explains how WSO2 Asgardio (OIDC) is integrated into this sample project so you can learn and adapt the pattern.

Contents
- How the integration works (high-level)
- Frontend: `oidc-client` usage and silent renew
- Backend: discovery and JWKS proxy + token verification
- Required Asgardio app settings
- Troubleshooting tips

## How it works (high-level)

- The frontend is a single-page React app (Vite). It does not fetch Asgardio discovery or JWKS directly from the browser to avoid CORS restrictions.
- The backend provides two small proxy endpoints that fetch Asgardio's discovery document and JWKS server-side. This keeps the browser free of CORS issues and centralizes the tenant URL.
- The frontend uses `oidc-client` to perform standard OIDC flows (authorization code + PKCE). Access tokens are stored in `localStorage` and are used by the frontend to call protected APIs.
- The backend validates incoming access tokens using the JWKS keys (RS256). This ensures the API accepts only tokens issued by your Asgardio tenant.

## Frontend (where)

- File: `frontend/src/Auth.js`
- Key points:
  - On startup, the frontend calls `GET http://localhost:4000/auth/.well-known/openid-configuration` (backend proxy) to obtain the tenant metadata (issuer, authorization endpoint, token endpoint, jwks_uri).
  - `oidc-client`'s `UserManager` is constructed at runtime using that metadata and the configured `client_id` and `redirect_uri`.
  - `automaticSilentRenew` is enabled with a `silent_redirect_uri` (`/silent-renew.html`) so `oidc-client` can renew tokens inside an iframe before they expire.
  - `getAccessToken()` checks the stored `user` and attempts `signinSilent()` if the token is expired. If silent renew fails, it falls back to interactive `signinRedirect()`.

## Backend (where)

- File: `backend/index.js`
- Key points:
  - `GET /auth/.well-known/openid-configuration` proxies to `https://<ASGARDIO_DOMAIN>/oauth2/oidcdiscovery/.well-known/openid-configuration` and returns the JSON to the frontend.
  - `GET /auth/jwks` proxies to `https://<ASGARDIO_DOMAIN>/oauth2/jwks` and returns the JWKS set.
  - The `verifyToken` middleware decodes the incoming access token to read the `kid` header, fetches the corresponding signing key from JWKS using `jwks-rsa`, then verifies the token signature and validity with `jsonwebtoken.verify(...)`.

## Required Asgardio app settings

When you register the application in Asgardio, ensure the following URLs exactly match your running app (including port):

- **Redirect URI**: `http://localhost:5173`
- **Post Logout Redirect URI**: `http://localhost:5173`
- **Silent Renew URI** (iframe): `http://localhost:5173/silent-renew.html`

Also note:
- Use `authorization_code` flow with PKCE enabled (this is the most secure for SPAs).
- Scopes used: `openid profile email`.

## Environment and config

- The backend uses `ASGARDIO_DOMAIN` environment variable (defaults in code to `https://api.asgardeo.io/t/org02fl3`).
- The frontend code has the `client_id` hard-coded for the demo; consider moving it to an env file or runtime config for production.

## Troubleshooting

- CORS errors fetching discovery from the browser: ensure you're using the backend proxy endpoints and that the backend is running on `http://localhost:4000`.
- Redirect mismatch error after sign-in: verify the redirect URI registered in Asgardio exactly matches the app origin and path (`http://localhost:5173`). Also ensure Vite runs on the same port.
- Silent renew failing: confirm `silent_redirect_uri` is registered in Asgardio and that `silent-renew.html` is served on the same origin.
- Token verification errors: check backend `ASGARDIO_DOMAIN` is correct and that `/auth/jwks` returns the expected keys.

## Learning notes

- Centralizing discovery and JWKS proxies on the server avoids CORS and hides tenant endpoints from the client.
- `oidc-client` handles the heavy lifting for OIDC flows and token renewal; the backend must always validate tokens on protected routes.
- For production, rotate client secrets safely, use HTTPS, and consider storing tokens securely (or using short-lived access tokens + refresh tokens handled by a secure backend).

---
Below is a quick example curl you can run (from a terminal) to see the tenant discovery document returned by the backend proxy:

```bash
curl http://localhost:4000/auth/.well-known/openid-configuration
```

If you want a diagram or a step-by-step walkthrough of the OIDC redirect flow, tell me which format you prefer (ASCII diagram, image, or a short step list) and I will add it.
