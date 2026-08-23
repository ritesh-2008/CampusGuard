import { typeById } from '../lib/incidents.js'
import { STATUS_META } from '../lib/utils.js'

export default function IncidentRow({ inc, onStatus, index = 0 }) {
  const t = typeById(inc.type)
  const status = STATUS_META[inc.status]

  return (
    <li
      className="incident-row"
      style={{ animationDelay: `${Math.min(index * 50, 300)}ms` }}
    >
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

        {inc.status === 'pending' && (
          <>
            <button type="button" className="btn-sm" onClick={() => onStatus(inc.id, 'verified')}>
              Verify
            </button>
            <button type="button" className="btn-sm btn-sm-danger" onClick={() => onStatus(inc.id, 'rejected')}>
              Reject
            </button>
          </>
        )}

        {inc.status === 'verified' && (
          <>
            <button type="button" className="btn-sm btn-sm-success" onClick={() => onStatus(inc.id, 'solved')}>
              Resolve
            </button>
            <button type="button" className="btn-sm btn-sm-danger" onClick={() => onStatus(inc.id, 'rejected')}>
              Reject
            </button>
          </>
        )}
      </div>
    </li>
  )
}
