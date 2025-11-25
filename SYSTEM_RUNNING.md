# System Running - Setup Complete ✅

## Current Status

Both servers are running and the chatbot application is live:

```
Backend:  http://localhost:4000  (Node.js + Express)
Frontend: http://localhost:5173  (React + Vite)
```

## Quick Access

Open your browser and go to: **http://localhost:5173**

## Next Steps: Configure Asgardio (REQUIRED for full login)

The app currently shows "Sign in with Asgardio" but requires Asgardio configuration to work.

### 1. Create Asgardio App (Free)

- Go to https://console.asgardeo.io and create a free account/org
- Create a **new application** (select "Single Page Application - SPA")
- Note your **Client ID**
- Note your **Organization name** (e.g., "myorg" → domain is `https://api.asgardeo.io/t/myorg`)

### 2. Configure Redirect URIs in Asgardio

In the app settings:
- **Sign-in Redirect URI**: `http://localhost:5173`
- **Sign-out Redirect URI**: `http://localhost:5173`
- **Allowed Origins**: `http://localhost:5173`
 
Note: This simplified setup uses `http://localhost:5173` as the redirect URL. Make sure your Asgardio application has:
- Sign-in Redirect URI: `http://localhost:5173`
- Post-logout Redirect URI: `http://localhost:5173`
- Allowed Origin: `http://localhost:5173`

### 3. Update Frontend Config

Edit `frontend/src/Auth.js` and replace:

```javascript
const asgardioConfig = {
  authority: 'https://api.asgardeo.io/t/YOUR_ORG',    // ← Replace YOUR_ORG
  client_id: 'YOUR_CLIENT_ID',                         // ← Paste your Client ID
  ...
}
```

**Example**:
```javascript
const asgardioConfig = {
  authority: 'https://api.asgardeo.io/t/myorg',
  client_id: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6',
  ...
}
```

### 4. Reload Frontend

After updating `Auth.js`, the Vite dev server will auto-reload. Then:
1. Click **"Sign in with Asgardio"**
2. You'll be redirected to Asgardio login
3. Sign in with your credentials
4. You'll return to the app with an access token
5. Now you can send messages!

## How It Works

1. **Frontend** (React):
   - Uses `oidc-client` for OIDC authentication
   - Redirects to Asgardio for login
   - Stores access token in browser
   - Includes token in all API requests as `Authorization: Bearer {token}`

2. **Backend** (Express):
   - Listens on `POST /api/chat` and `GET /api/messages`
   - Extracts and decodes JWT tokens from requests
   - Associates messages with user `sub` claim from JWT
   - In-memory store (cleared on restart)

3. **Messages**:
   - Only authenticated users can send/view messages
   - Each message tagged with sender's user ID
   - All chat messages visible to all authenticated users

## Project Files

```
Project/
├── backend/
│   ├── index.js          ← Express server (verify token, chat endpoints)
│   ├── chatStore.js      ← In-memory message storage
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx       ← Chat UI component
│   │   ├── Auth.js       ← Asgardio OIDC config (EDIT THIS)
│   │   ├── api.js        ← API client with auth header
│   │   ├── main.jsx      ← Entry point
│   │   └── styles.css    ← Simple styling
│   ├── index.html
│   └── package.json
└── README.md
```

## Stopping Servers

In PowerShell terminal where each is running, press `Ctrl+C` to stop.

## Restart Later

```powershell
# Terminal 1: Backend
cd "c:\Users\abdul\OneDrive\Desktop\Project\backend"
node index.js

# Terminal 2: Frontend
cd "c:\Users\abdul\OneDrive\Desktop\Project\frontend"
npm run dev
```

---

**Ready to test?** Get your Asgardio credentials and follow "Configure Asgardio" above!
