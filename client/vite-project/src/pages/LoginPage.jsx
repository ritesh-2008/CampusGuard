import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import api from '../lib/axios.js'
import './LoginPage.css'

const GoogleIcon = () => (
  <svg viewBox="0 0 48 48" width="20" height="20" aria-hidden="true">
    <path
      fill="#EA4335"
      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
    />
    <path
      fill="#4285F4"
      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
    />
    <path
      fill="#FBBC05"
      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
    />
    <path
      fill="#34A853"
      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
    />
  </svg>
)

const FEATURES = [
  {
    emoji: '🚨',
    title: 'One-tap emergency alert',
    desc: 'Report fire, medical, harassment, flooding and more in seconds.',
  },
  {
    emoji: '📍',
    title: 'Alerts with distance & exits',
    desc: 'Nearby students see how far away the danger is and the safest exit.',
  },
  {
    emoji: '🗺️',
    title: 'Live map for admins',
    desc: 'Campus security tracks every incident in real time and dispatches help.',
  },
]

function LoginPage() {
  const [session, setSession] = useState(null)
  const [verified, setVerified] = useState(false)
  const [loading, setLoading] = useState(true)
  const [signingIn, setSigningIn] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Verify the session token against the backend on sign-in.
  useEffect(() => {
    if (!session) return

    let cancelled = false

    api
      .get('/api/auth/me')
      .then(() => {
        if (!cancelled) setVerified(true)
      })
      .catch((err) => {
        console.warn('Backend verification failed:', err.message)
        if (!cancelled) setVerified(false)
      })

    return () => {
      cancelled = true
    }
  }, [session])

  const handleGoogleSignIn = async () => {
    setSigningIn(true)
    setError(null)

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })

    if (error) {
      setError(error.message)
      setSigningIn(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  const renderHero = (
    <aside className="login-hero">
      <div className="brand">
        <span className="brand-mark">🚨</span>
        <div className="brand-text">
          <span className="brand-name">CampusGuard</span>
          <span className="brand-sub">Emergency Campus Network</span>
        </div>
      </div>

      <h1>Your campus, protected in real time.</h1>
      <p className="hero-sub">
        A real-time emergency system for colleges. Students report incidents with one tap,
        nearby peers get instant alerts with safe exits, and admins watch everything on a
        live map.
      </p>

      <ul className="feature-list">
        {FEATURES.map((f) => (
          <li key={f.title}>
            <span className="feature-emoji">{f.emoji}</span>
            <div>
              <strong>{f.title}</strong>
              <p>{f.desc}</p>
            </div>
          </li>
        ))}
      </ul>

      <div className="hero-alert" aria-hidden="true">
        <div className="hero-alert-head">🚨 EMERGENCY</div>
        <p className="hero-alert-title">Fire reported near Chemistry Lab</p>
        <div className="hero-alert-meta">
          <span>📍 Distance: 180m</span>
          <span>🚪 Recommended: leave through Gate 2</span>
        </div>
      </div>

      <div className="hero-stats">
        <div>
          <strong>&lt;30s</strong>
          <span>alert delivery</span>
        </div>
        <div>
          <strong>24/7</strong>
          <span>monitoring</span>
        </div>
        <div>
          <strong>100%</strong>
          <span>campus coverage</span>
        </div>
      </div>
    </aside>
  )

  if (loading) {
    return (
      <div className="login">
        {renderHero}
        <main className="login-panel">
          <div className="card">
            <p className="muted">Loading…</p>
          </div>
        </main>
      </div>
    )
  }

  if (session) {
    const { user } = session
    return (
      <div className="login">
        {renderHero}
        <main className="login-panel">
          <div className="card">
            <h1>Signed in</h1>
            {user.user_metadata?.avatar_url && (
              <img className="avatar" src={user.user_metadata.avatar_url} alt="Profile" />
            )}
            <p className="email">{user.email}</p>
            {verified ? (
              <p className="muted ok">✓ Token verified by the backend</p>
            ) : (
              <p className="muted">Backend not reachable</p>
            )}
            <div className="card-actions">
              <Link to="/dashboard" className="btn">
                Go to dashboard
              </Link>
              <button type="button" className="btn-outline" onClick={handleSignOut}>
                Sign out
              </button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="login">
      {renderHero}
      <main className="login-panel">
        <div className="card">
          <h1>Welcome</h1>
          <p className="muted">Sign in with your campus Google account</p>
          {error && <p className="error">{error}</p>}
          <button
            type="button"
            className="google-btn"
            onClick={handleGoogleSignIn}
            disabled={signingIn}
          >
            <GoogleIcon />
            {signingIn ? 'Redirecting…' : 'Continue with Google'}
          </button>
          <p className="login-note">🔒 Sign-in verifies your campus identity before alerts are sent.</p>
        </div>
      </main>
    </div>
  )
}

export default LoginPage
