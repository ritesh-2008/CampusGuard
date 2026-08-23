import { typeById } from '../lib/incidents.js'

export default function CampusMap({ incidents }) {
  const active = incidents.filter(
    (inc) => inc.status !== 'solved' && inc.status !== 'rejected'
  )

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
          <text x="140" y="108" className="map-zone-sub">Admin &amp; security</text>
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
          <text x="415" y="372" className="map-zone-sub">Gym &amp; fields</text>
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
        {active.map((inc) => {
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
