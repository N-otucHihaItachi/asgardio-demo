import { UserManager, WebStorageStateStore } from 'oidc-client'

let userManager = null

async function ensureUserManager() {
  if (userManager) return userManager

  // Fetch OIDC metadata from backend proxy to avoid CORS issues
  const resp = await fetch('http://localhost:4000/auth/.well-known/openid-configuration')
  if (!resp.ok) throw new Error('Failed to load OIDC metadata from backend')
  const metadata = await resp.json()

  const origin = window.location.origin
  // Use the provided Asgardio settings (redirect to root)
  const cfg = {
    metadata,
    authority: metadata.issuer,
    client_id: '6X50o3_1KNfaZHOibbo1w2Xe9oca',
    redirect_uri: 'http://localhost:5173',
    post_logout_redirect_uri: 'http://localhost:5173',
    // Enable silent renew using iframe
    automaticSilentRenew: true,
    silent_redirect_uri: 'http://localhost:5173/silent-renew.html',
    response_type: 'code',
    scope: 'openid profile email',
    userStore: new WebStorageStateStore({ store: window.localStorage })
  }
  // Log the constructed config so you can verify the exact redirect URI used at runtime
  console.log('OIDC config (runtime):', { origin, redirect_uri: cfg.redirect_uri, client_id: cfg.client_id, issuer: cfg.authority })

  userManager = new UserManager(cfg)
  return userManager
}

export default {
  signinRedirect: async () => (await ensureUserManager()).signinRedirect(),
  signinRedirectCallback: async () => (await ensureUserManager()).signinRedirectCallback(),
  signinSilent: async () => (await ensureUserManager()).signinSilent(),
  signoutRedirect: async () => (await ensureUserManager()).signoutRedirect(),
  getUser: async () => (await ensureUserManager()).getUser(),
  getAccessToken: async () => {
    const mgr = await ensureUserManager()
    let u = await mgr.getUser()
    // If user exists and token expired, try silent renew first
    if (u && u.expired) {
      try {
        await mgr.signinSilent()
        u = await mgr.getUser()
      } catch (e) {
        console.warn('Silent renew failed, will require interactive sign-in', e)
        // fallback: interactive redirect
        await mgr.signinRedirect()
        return null
      }
    }
    return u?.access_token
  }
}
