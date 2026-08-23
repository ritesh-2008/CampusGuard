import { useCallback, useEffect, useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import api from '../lib/axios.js'
import { typeById } from '../lib/incidents.js'
import { mapIncident } from '../lib/utils.js'
import StudentView from '../components/StudentView.jsx'
import AdminView from '../components/AdminView.jsx'
import './DashboardPage.css'

export default function DashboardPage() {
  /* ── Auth state ─────────────────────────────────────────────────── */
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  /* ── Role / tab ─────────────────────────────────────────────────── */
  const [role, setRole] = useState('student')

  /* ── Student form state ─────────────────────────────────────────── */
  const [selectedType, setSelectedType] = useState(null)
  const [description, setDescription] = useState('')
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState(null)
  const [sentAlert, setSentAlert] = useState(null)
  const [broadcasts, setBroadcasts] = useState([])

  /* ── Incident data (admin + realtime) ───────────────────────────── */
  const [incidents, setIncidents] = useState([])

  /* ── Derived: admin check (stable across re-renders) ────────────── */
  const isAdmin = useMemo(() => {
    const adminEmail = import.meta.env.VITE_ADMIN_EMAIL
    return !!adminEmail && session?.user?.email === adminEmail
  }, [session])

  /* ── Auth listener ──────────────────────────────────────────────── */
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
    })

    return () => subscription.unsubscribe()
  }, [])

  /* ── Verify token against backend ───────────────────────────────── */
  useEffect(() => {
    if (!session) return

    let cancelled = false
    api
      .get('/api/auth/me')
      .then(() => {
        if (!cancelled) setError(null)
      })
      .catch((err) => {
        if (!cancelled && !err.response) {
          setError('Could not reach the campus server. Please check your connection.')
        }
      })

    return () => { cancelled = true }
  }, [session])

  /* ── Fetch incidents ────────────────────────────────────────────── */
  const fetchIncidents = useCallback(async () => {
    const { data } = await api.get('/api/incidents')
    return data.success ? data.incidents.map(mapIncident) : null
  }, [])

  useEffect(() => {
    if (!session) return

    let cancelled = false
    fetchIncidents()
      .then((mapped) => {
        if (!cancelled && mapped) {
          setIncidents(mapped)
          setError(null)
        }
      })
      .catch((err) => {
        if (!cancelled && !err.response) {
          setError('Could not reach the campus server. The dashboard will update once the connection is restored.')
        }
      })

    return () => { cancelled = true }
  }, [session, fetchIncidents])

  /* ── Realtime: listen for new incidents ──────────────────────────── */
  useEffect(() => {
    if (!session) return

    const channel = supabase
      .channel('incidents-live')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'incidents' },
        (payload) => {
          const inc = mapIncident(payload.new)
          setIncidents((prev) => (prev.some((i) => i.id === inc.id) ? prev : [inc, ...prev]))
        },
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [session])

  /* ── Auto-retry when backend is unreachable ─────────────────────── */
  useEffect(() => {
    if (!session || !error) return

    const id = setInterval(() => {
      fetchIncidents()
        .then((mapped) => {
          if (mapped) {
            setIncidents(mapped)
            setError(null)
          }
        })
        .catch(() => {})
    }, 10_000)

    return () => clearInterval(id)
  }, [session, error, fetchIncidents])

  /* ── Handlers ───────────────────────────────────────────────────── */
  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.assign('/')
  }

  const handleSendAlert = async () => {
    if (!selectedType) {
      setSendError('Select an incident type first.')
      return
    }

    const t = typeById(selectedType)
    setSending(true)
    setSendError(null)

    let demo = false
    try {
      await api.post('/api/incidents', {
        type: t.id,
        description: description.trim() || `${t.label} reported on campus`,
        severity: t.severity,
      })
      fetchIncidents()
        .then((mapped) => { if (mapped) { setIncidents(mapped); setError(null) } })
        .catch((err) => console.warn('Failed to refresh incidents:', err.message))
    } catch (err) {
      console.warn('Incident report failed:', err.message)
      setSendError(`Incident could not be sent: ${err.message}`)
      demo = true
    }

    const alert = {
      id: Date.now(),
      type: t.id,
      location: 'Chemistry Lab',
      distance: 180,
      exit: 'Gate 2',
      time: 'just now',
      demo,
    }

    setSentAlert(alert)
    setBroadcasts((prev) => [alert, ...prev].slice(0, 6))
    setSending(false)
    setSelectedType(null)
    setDescription('')
  }

  const updateStatus = async (id, status) => {
    setIncidents((prev) => prev.map((inc) => (inc.id === id ? { ...inc, status } : inc)))
    try {
      await api.patch(`/api/incidents/${id}/status`, { status })
    } catch (err) {
      console.error('Failed to update status:', err.message)
      fetchIncidents()
        .then((mapped) => { if (mapped) setIncidents(mapped) })
        .catch(() => {})
    }
  }

  /* ── Guards ─────────────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="dash-page dash-loading">
        <p className="dash-muted">Loading…</p>
      </div>
    )
  }

  if (!session) return <Navigate to="/" replace />

  const { user } = session
  const name = user.user_metadata?.full_name ?? 'Your account'
  const avatar = user.user_metadata?.avatar_url

  /* ── Render ─────────────────────────────────────────────────────── */
  return (
    <div className="dash-page">
      <header className="dash-header">
        <div className="brand">
          <span className="brand-mark">🚨</span>
          <div className="brand-text">
            <span className="brand-name">CampusGuard</span>
            <span className="brand-sub">Emergency Campus Network</span>
          </div>
        </div>

        <div className="role-switch" role="tablist" aria-label="Dashboard view">
          <button
            type="button"
            role="tab"
            aria-selected={role === 'student'}
            className={role === 'student' ? 'active' : ''}
            onClick={() => setRole('student')}
          >
            🎓 Student
          </button>
          {isAdmin && (
            <button
              type="button"
              role="tab"
              aria-selected={role === 'admin'}
              className={role === 'admin' ? 'active' : ''}
              onClick={() => setRole('admin')}
            >
              🛡️ Admin
            </button>
          )}
        </div>

        <div className="dash-user">
          {avatar && <img className="dash-avatar" src={avatar} alt="" />}
          <span className="dash-user-name">{name}</span>
          <button type="button" className="btn-outline btn-signout" onClick={handleSignOut}>
            Sign out
          </button>
        </div>
      </header>

      <main className="dash-main">
        {error && (
          <p
            className="dash-error-banner"
            onClick={() => setError(null)}
            role="alert"
            style={{ cursor: 'pointer' }}
            title="Click to dismiss"
          >
            {error}
          </p>
        )}

        {role === 'student' ? (
          <StudentView
            selectedType={selectedType}
            onSelectType={(id) => { setSelectedType(id); setSendError(null) }}
            description={description}
            onDescriptionChange={setDescription}
            sending={sending}
            sendError={sendError}
            onSendAlert={handleSendAlert}
            sentAlert={sentAlert}
            broadcasts={broadcasts}
          />
        ) : (
          <AdminView incidents={incidents} onStatus={updateStatus} />
        )}
      </main>
    </div>
  )
}
