import { typeById } from '../lib/incidents.js'

export default function BroadcastCard({ alert, highlight }) {
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

      {highlight && (
        <p className="broadcast-note">
          You reported this alert. Campus security has been notified.
        </p>
      )}

      {alert.demo && (
        <p className="broadcast-note broadcast-demo">
          Demo preview — backend not reachable, alert not transmitted.
        </p>
      )}
    </div>
  )
}
