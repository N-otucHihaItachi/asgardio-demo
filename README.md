# Simple Chatbot (React + Express) with WSO2 Asgardio OIDC

A minimal chatbot application integrated with **WSO2 Asgardio** for secure OIDC-based authentication.

- **Backend**: Node.js + Express + JWKS-RSA for JWT verification
- **Frontend**: React (Vite) + @asgardio/auth-react official SDK
- **Auth**: WSO2 Asgardio (OIDC) with RS256 JWT signature verification

## Project Structure

```
Project/
├── backend/          # Express server + chat logic
│   ├── index.js      # Main server with JWT verification
│   ├── chatStore.js  # In-memory message store
│   └── package.json
├── frontend/         # React app (Vite)
│   ├── src/
│   │   ├── App.jsx        # Chat UI component
│   │   ├── Auth.js        # Asgardio config
│   │   ├── api.js         # API client with auth interceptor
│   │   ├── main.jsx       # Entry point with AuthProvider
│   │   └── styles.css
│   ├── index.html
│   └── package.json
└── README.md
```

## Asgardio Setup (Required First)

1. **Register Application in Asgardio**:
   - Go to https://console.asgardeo.io
   - Create a new application (Single Page Application - SPA)
   - Note your **Client ID** and **Organization Name**

2. **Configure Redirect URIs**:
    - Sign-in Redirect URI: `http://localhost:5173`
    - Post-logout / Sign-out Redirect URI: `http://localhost:5173`
    - Allowed Origin: `http://localhost:5173`

    Note: The redirect URI must exactly match the URL used at runtime (including port). If you run Vite on a different port, update Asgardio or run the frontend on `5173`.

3. **Update `frontend/src/Auth.js`**:
   - Ensure `client_id` in `frontend/src/Auth.js` contains your Asgardio Client ID.
   - The app constructs the `redirect_uri` at runtime from `window.location.origin` and will use `origin/callback`.
   - If you run the frontend on a different port, add that exact `origin/callback` in Asgardio as shown above.

4. **Set Backend Environment Variable** (Windows PowerShell):
   ```powershell
   $env:ASGARDIO_DOMAIN = 'https://api.asgardeo.io/t/YOUR_ORG'
   ```

## Quick Start (Windows PowerShell)

### Terminal 1: Start Backend

```powershell
cd "c:\Users\abdul\OneDrive\Desktop\Project\backend"
npm install
npm start
```

Expected output: `Server running on port 4000`

### Terminal 2: Start Frontend

```powershell
cd "c:\Users\abdul\OneDrive\Desktop\Project\frontend"
npm install
npm run dev
```

Expected output: `VITE v5.x.x  ready in xxx ms → Local: http://localhost:5173/`

## How It Works

1. **Sign In**: Click "Sign in with Asgardio" → redirects to Asgardio login → returns to app with access token
2. **Send Message**: Type and click Send → frontend sends POST request with Bearer token → backend verifies JWT signature against Asgardio's JWKS
3. **View Messages**: Frontend fetches all messages via GET request (also requires valid token)
4. **Sign Out**: Clears session and tokens

## JWT Verification

The backend:
- Fetches Asgardio's JWKS (public keys) from `{ASGARDIO_DOMAIN}/oauth2/jwks`
- Verifies the `RS256` signature of incoming JWT tokens
- Extracts the `sub` claim to identify users
- Returns 401 Unauthorized if token is invalid or expired

## Notes

- **In-Memory Store**: Messages are cleared on backend restart
- **CORS Enabled**: Backend accepts requests from `http://localhost:5173`
 - **CORS Enabled**: Backend accepts requests from `http://localhost:5173` and `http://localhost:5174`
- **Token Expiry**: Access tokens expire; after expiry, you'll need to sign in again
- **Production**: Add database persistence, implement refresh token rotation, and use HTTPS