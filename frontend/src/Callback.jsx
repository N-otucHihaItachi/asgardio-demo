import React, { useEffect, useState } from 'react'
import userManager from './Auth'

export default function Callback() {
  const [err, setErr] = useState(null)

  useEffect(() => {
    (async () => {
      try {
        // Process the signin redirect callback then navigate home
        await userManager.signinRedirectCallback()
        window.location.replace('/')
      } catch (e) {
        console.error('Callback handling failed:', e)
        setErr(String(e))
      }
    })()
  }, [])

  if (err) return (
    <div style={{ padding: 20 }}>
      <h3>Sign-in callback failed</h3>
      <pre style={{ whiteSpace: 'pre-wrap' }}>{err}</pre>
    </div>
  )

  return (
    <div style={{ padding: 20 }}>
      <h3>Completing sign-in...</h3>
      <p>If you are not redirected automatically, wait a moment or check the browser console for errors.</p>
    </div>
  )
}
