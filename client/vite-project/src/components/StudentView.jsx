import { INCIDENT_TYPES, typeById } from '../lib/incidents.js'
import BroadcastCard from './BroadcastCard.jsx'

export default function StudentView({
  selectedType,
  onSelectType,
  description,
  onDescriptionChange,
  sending,
  sendError,
  onSendAlert,
  sentAlert,
  broadcasts,
}) {
  return (
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
              onClick={() => onSelectType(t.id)}
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
          placeholder='Add details (optional) — e.g. "Smoke on the 2nd floor near the fume hoods"'
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
        />

        {sendError && <p className="dash-error">{sendError}</p>}

        <button
          type="button"
          className="alert-btn"
          onClick={onSendAlert}
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
              <span>Fire &amp; Rescue</span>
              <strong>101</strong>
            </li>
          </ul>
        </div>
      </section>
    </div>
  )
}
