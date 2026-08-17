export const INCIDENT_TYPES = [
  { id: 'fire', label: 'Fire', emoji: '🔥', severity: 'critical', color: '#ef4444' },
  { id: 'medical', label: 'Medical Emergency', emoji: '🚑', severity: 'critical', color: '#f43f5e' },
  { id: 'harassment', label: 'Harassment', emoji: '🛡️', severity: 'high', color: '#f97316' },
  { id: 'infrastructure', label: 'Infrastructure Danger', emoji: '⚠️', severity: 'high', color: '#f59e0b' },
  { id: 'suspicious', label: 'Suspicious Activity', emoji: '👀', severity: 'medium', color: '#eab308' },
  { id: 'flooding', label: 'Flooding', emoji: '🌊', severity: 'high', color: '#38bdf8' },
]

export const typeById = (id) => INCIDENT_TYPES.find((t) => t.id === id)
