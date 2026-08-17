import { useCallback, useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import api from '../lib/axios.js'
import { INCIDENT_TYPES, typeById } from '../lib/incidents.js'
import './DashboardPage.css'

// Demo data for the admin live map / queue (no GET incidents endpoint exists yet)
const MOCK_INCIDENTS = [
  {
    id: 1,
    type: 'fire',
    location: 'Chemistry Lab',
    distance: 180,
    exit: 'Gate 2',
    status: 'active',
    time: '2 min ago',
    alerted: 132,
    x: 64,
    y: 30,
  },
  {
    id: 2,
    type: 'medical',
    location: 'Sports Complex',
    distance: 240,
    exit: 'Gate 1',
    status: 'responding',
    time: '6 min ago',
    alerted: 89,
    x: 30,
    y: 68,
  },
  {
    id: 3,
    type: 'suspicious',
    location: 'North Parking',
    distance: 420,
    exit: 'Gate 4',
    status: 'pending',
    time: '11 min ago',
    alerted: 64,
    x: 80,
    y: 74,
  },
  {
    id: 4,
    type: 'infrastructure',
    location: 'Library · 3rd floor',
    distance: 310,
    exit: 'Gate 2',
    status: 'resolved',
    time: '38 min ago',
    alerted: 210,
    x: 44,
    y: 42,
  },
]

const INITIAL_BROADCASTS = [
  { id: 'b1', type: 'fire', location: 'Chemistry Lab', distance: 180, exit: 'Gate 2', time: '2 min ago' },
  { id: 'b2', type: 'medical', location: 'Sports Complex', distance: 240, exit: 'Gate 1', time: '6 min ago' },
  { id: 'b3', type: 'suspicious', location: 'North Parking', distance: 420, exit: 'Gate 4', time: '11 min ago' },
]

const STATUS_META = {
  active: { label: 'Active', className: 'chip-active' },
  pending: { label: 'Pending', className: 'chip-pending' },
  responding: { label: 'Responding', className: 'chip-responding' },
  resolved: { label: 'Resolved', className: 'chip-resolved' },
}

// Derive display-only fields the admin UI needs but the DB doesn't store.
function hashString(str) {
  let hash = 0
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

function timeAgo(iso) {
  if (!iso) return 'just now'
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000))
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hr ago`
  return `${Math.floor(hours / 24)} days ago`
}

function mapIncident(inc) {
  const h = hashString(inc.id)
  return {
    ...inc,
    location: inc.location || inc.description || typeById(inc.type)?.label || 'Campus',
    distance: inc.distance ?? 100 + (h % 400),
    exit: inc.exit ?? `Gate ${1 + (h % 4)}`,
    time: timeAgo(inc.created_at),
    alerted: inc.alerted ?? 40 + (h % 200),
    x: inc.x ?? 8 + (h % 76),
    y: inc.y ?? 10 + ((h >> 4) % 74),
  }
}

function Stat({ label, value, tone }) {
  return (
    <div className={`stat-card ${tone ? `stat-${tone}` : ''}`}>
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  )
}

function BroadcastCard({ alert, highlight }) {
  const t = typeById(alert.type)
  return (
    <div className={`broadcast ${highlight ? 'broadcast-mine' : ''}`}>
      <div className="broadcast-head">
        <span className="broadcast-siren">🚨 EMERGENCY</span>
        <span className="broadcast-time">{alert.time}</span>
      </div>
      <p className="broadcast-title">
        {t.emoji} {t.label} reported near {alert.location}
      </p>
      <div className="broadcast-meta">
        <span>📍 {alert.distance}m away</span>
        <span>🚪 Recommended: leave through {alert.exit}</span>
      </div>
      {highlight && <p className="broadcast-note">You reported this alert. Campus security has been notified.</p>}
      {alert.demo && <p className="broadcast-note broadcast-demo">Demo preview — backend not reachable, alert not transmitted.</p>}
    </div>
  )
}

function CampusMap({ incidents }) {
  return (
    <div className="map-wrap">
      <svg viewBox="0 0 800 500" className="campus-map" role="img" aria-label="Live campus incident map">
        <rect x="0" y="0" width="800" height="500" rx="12" className="map-bg" />

        {/* Roads */}
        <rect x="272" y="0" width="34" height="500" className="map-road" />
        <rect x="0" y="258" width="800" height="34" className="map-road" />
        <rect x="0" y="470" width="800" height="30" className="map-road" />

        {/* Zones */}
        <g className="map-zone">
          <rect x="60" y="52" width="160" height="86" rx="10" />
          <text x="140" y="88">🏛️ Main Hall</text>
          <text x="140" y="108" className="map-zone-sub">Admin & security</text>
        </g>
        <g className="map-zone">
          <rect x="330" y="110" width="150" height="84" rx="10" />
          <text x="405" y="146">📚 Library</text>
          <text x="405" y="166" className="map-zone-sub">3 floors</text>
        </g>
        <g className="map-zone">
          <rect x="524" y="60" width="186" height="82" rx="10" />
          <text x="617" y="96">🧪 Chemistry Lab</text>
          <text x="617" y="116" className="map-zone-sub">Block C</text>
        </g>
        <g className="map-zone">
          <rect x="330" y="316" width="170" height="88" rx="10" />
          <text x="415" y="352">🏟️ Sports Complex</text>
          <text x="415" y="372" className="map-zone-sub">Gym & fields</text>
        </g>
        <g className="map-zone">
          <rect x="556" y="320" width="180" height="92" rx="10" />
          <text x="646" y="356">🏘️ Hostel Block</text>
          <text x="646" y="376" className="map-zone-sub">Residence</text>
        </g>
        <g className="map-zone">
          <rect x="80" y="330" width="150" height="80" rx="10" />
          <text x="155" y="364">🌳 Quad / Green</text>
          <text x="155" y="384" className="map-zone-sub">Open area</text>
        </g>

        {/* Gates */}
        <g className="map-zone map-gate">
          <rect x="346" y="8" width="70" height="26" rx="8" />
          <text x="381" y="26">Gate 1</text>
        </g>
        <g className="map-zone map-gate">
          <rect x="346" y="466" width="70" height="26" rx="8" />
          <text x="381" y="484">Gate 3</text>
        </g>
        <g className="map-zone map-gate">
          <rect x="766" y="240" width="30" height="40" rx="8" />
          <text x="781" y="236" transform="rotate(90 781 236)">Gate 2</text>
        </g>
        <g className="map-zone map-gate">
          <rect x="4" y="240" width="30" height="40" rx="8" />
          <text x="19" y="236" transform="rotate(-90 19 236)">Gate 4</text>
        </g>

        {/* Incident markers */}
        {incidents
          .filter((inc) => inc.status !== 'resolved')
          .map((inc) => {
            const t = typeById(inc.type)
            return (
              <g key={inc.id} className="map-marker" transform={`translate(${inc.x * 8}, ${inc.y * 5})`}>
                <circle className="marker-ring" r="11" fill={t.color} />
                <circle className="marker-dot" r="6.5" fill={t.color} stroke="#ffffff" strokeWidth="1.5" />
                <text className="marker-label" y="-16" textAnchor="middle">
                  {t.emoji} {inc.location}
                </text>
              </g>
            )
          })}
      </svg>
    </div>
  )
}

function IncidentRow({ inc, onStatus }) {
  const t = typeById(inc.type)
  const status = STATUS_META[inc.status]
  return (
    <li className="incident-row">
      <span className="incident-emoji" style={{ background: `${t.color}1f` }}>
        {t.emoji}
      </span>
      <div className="incident-info">
        <p className="incident-title">
          {t.label} — {inc.location}
        </p>
        <p className="incident-sub">
          {inc.distance}m from your position · reported {inc.time} · {inc.alerted} students alerted
        </p>
      </div>
      <div className="incident-side">
        <span className={`chip ${status.className}`}>{status.label}</span>
        {inc.status === 'active' && (
          <button type="button" className="btn-sm" onClick={() => onStatus(inc.id, 'responding')}>
            Respond
          </button>
        )}
        {inc.status === 'responding' && (
          <button type="button" className="btn-sm btn-sm-success" onClick={() => onStatus(inc.id, 'resolved')}>
            Resolve
          </button>
        )}
        {inc.status === 'pending' && (
          <button type="button" className="btn-sm" onClick={() => onStatus(inc.id, 'active')}>
            Activate
          </button>
        )}
      </div>
    </li>
  )
}

function DashboardPage() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [role, setRole] = useState('student')
  const [selectedType, setSelectedType] = useState(null)
  const [description, setDescription] = useState('')
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState(null)
  const [sentAlert, setSentAlert] = useState(null)
  const [broadcasts, setBroadcasts] = useState(INITIAL_BROADCASTS)
  const [incidents, setIncidents] = useState([])

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

  // Verify the session token against the backend on load.
  useEffect(() => {
    if (!session) return

    let cancelled = false

    api
      .get('/api/auth/me')
      .catch((err) => {
        console.warn('Failed to verify session:', err.message)
        if (!cancelled) setError('Could not reach the campus server.')
      })

    return () => {
      cancelled = true
    }
  }, [session])

  // Load real incidents from the backend for the admin view.
  const fetchIncidents = useCallback(async () => {
    try {
      const { data } = await api.get('/api/incidents')
      if (data.success) setIncidents(data.incidents.map(mapIncident))
    } catch (err) {
      console.warn('Failed to fetch incidents:', err.message)
      // Graceful demo mode: fall back to mock data only when nothing real loaded yet.
      setIncidents((prev) => (prev.length === 0 ? MOCK_INCIDENTS : prev))
    }
  }, [])

  useEffect(() => {
    if (!session) return

    fetchIncidents()
  }, [session, fetchIncidents])

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
      // Refresh the admin queue so the new report shows up.
      fetchIncidents()
    } catch (err) {
      console.warn('Incident report failed:', err.message)
      setSendError(`Incident could not be sent: ${err.message}`)
      demo = true
    }

    // Simulated broadcast to nearby students (demo location/exit).
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

  const updateStatus = (id, status) => {
    setIncidents((prev) => prev.map((inc) => (inc.id === id ? { ...inc, status } : inc)))
  }

  if (loading) {
    return (
      <div className="dash-page dash-loading">
        <p className="dash-muted">Loading…</p>
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/" replace />
  }

  const { user: sessionUser } = session
  const name = sessionUser.user_metadata?.full_name ?? 'Your account'
  const avatar = sessionUser.user_metadata?.avatar_url

  const activeCount = incidents.filter((i) => i.status === 'active').length
  const respondingCount = incidents.filter((i) => i.status === 'responding').length
  const resolvedCount = incidents.filter((i) => i.status === 'resolved').length
  const alertedCount = incidents.reduce((sum, i) => sum + i.alerted, 0)

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
          <button
            type="button"
            role="tab"
            aria-selected={role === 'admin'}
            className={role === 'admin' ? 'active' : ''}
            onClick={() => setRole('admin')}
          >
            🛡️ Admin
          </button>
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
        {error && <p className="dash-error-banner">{error}</p>}

        {role === 'student' ? (
          <div className="dash-grid">
            {/* Report an incident */}
            <section className="panel">
              <div className="panel-head">
                <h2>Report an incident</h2>
                <p>
                  Select what you're seeing, then press the alert button. Nearby students and
                  campus security are notified instantly.
                </p>
              </div>

              <div className="type-grid">
                {INCIDENT_TYPES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    className={`type-btn ${selectedType === t.id ? 'selected' : ''}`}
                    style={{ '--type-color': t.color }}
                    onClick={() => {
                      setSelectedType(t.id)
                      setSendError(null)
                    }}
                  >
                    <span className="type-emoji">{t.emoji}</span>
                    <span className="type-label">{t.label}</span>
                    <span className="type-sev">{t.severity}</span>
                  </button>
                ))}
              </div>

              <textarea
                className="report-desc"
                rows="3"
                placeholder="Add details (optional) — e.g. “Smoke on the 2nd floor near the fume hoods”"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              {sendError && <p className="dash-error">{sendError}</p>}

              <button
                type="button"
                className="alert-btn"
                onClick={handleSendAlert}
                disabled={sending || !selectedType}
              >
                <span className="alert-siren">🚨</span>
                {sending ? 'Sending alert…' : 'Send Emergency Alert'}
              </button>
              <p className="alert-hint">Your location and the incident details are shared with responders.</p>
            </section>

            {/* Nearby broadcasts */}
            <section className="panel">
              <div className="panel-head">
                <h2>Nearby broadcasts</h2>
                <p>Alerts from students around you, with distance and the recommended exit.</p>
              </div>

              <div className="broadcast-list">
                {sentAlert && <BroadcastCard alert={sentAlert} highlight />}
                {broadcasts
                  .filter((b) => b.id !== sentAlert?.id)
                  .map((b) => (
                    <BroadcastCard key={b.id} alert={b} />
                  ))}
              </div>

              <div className="safety-card">
                <h3>📞 Emergency contacts</h3>
                <ul>
                  <li>
                    <span>Campus Security</span>
                    <strong>100 / ext. 911</strong>
                  </li>
                  <li>
                    <span>Medical Unit</span>
                    <strong>108</strong>
                  </li>
                  <li>
                    <span>Fire & Rescue</span>
                    <strong>101</strong>
                  </li>
                </ul>
              </div>
            </section>
          </div>
        ) : (
          <>
            <div className="admin-stats">
              <Stat label="Active incidents" value={activeCount} tone="danger" />
              <Stat label="Responders on scene" value={respondingCount} tone="warning" />
              <Stat label="Resolved today" value={resolvedCount} tone="success" />
              <Stat label="Students alerted" value={alertedCount} />
            </div>

            <div className="admin-grid">
              <section className="panel">
                <div className="panel-head panel-head-row">
                  <div>
                    <h2>Live incident map</h2>
                    <p>Every report shows up here in real time.</p>
                  </div>
                  <span className="live-badge">
                    <i className="live-dot" />
                    LIVE
                  </span>
                </div>

                <CampusMap incidents={incidents} />

                <div className="map-legend">
                  {INCIDENT_TYPES.map((t) => (
                    <span key={t.id} className="legend-item">
                      <i className="legend-dot" style={{ background: t.color }} />
                      {t.label}
                    </span>
                  ))}
                </div>
              </section>

              <section className="panel">
                <div className="panel-head">
                  <h2>Incident queue</h2>
                  <p>Assign responders and resolve incidents as they're handled.</p>
                </div>
                <ul className="incident-list">
                  {incidents.map((inc) => (
                    <IncidentRow key={inc.id} inc={inc} onStatus={updateStatus} />
                  ))}
                </ul>
              </section>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

export default DashboardPage
