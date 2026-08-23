import { INCIDENT_TYPES } from '../lib/incidents.js'
import Stat from './Stat.jsx'
import CampusMap from './CampusMap.jsx'
import IncidentRow from './IncidentRow.jsx'

export default function AdminView({ incidents, onStatus }) {
  const pendingCount = incidents.filter((i) => i.status === 'pending').length
  const verifiedCount = incidents.filter((i) => i.status === 'verified').length
  const solvedCount = incidents.filter((i) => i.status === 'solved').length
  const alertedCount = incidents.reduce((sum, i) => sum + i.alerted, 0)

  return (
    <>
      <div className="admin-stats">
        <Stat label="Pending incidents" value={pendingCount} tone="danger" />
        <Stat label="Verified incidents" value={verifiedCount} tone="warning" />
        <Stat label="Solved today" value={solvedCount} tone="success" />
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
            {incidents.map((inc, i) => (
              <IncidentRow key={inc.id} inc={inc} onStatus={onStatus} index={i} />
            ))}
          </ul>
        </section>
      </div>
    </>
  )
}
