import { typeById } from './incidents.js'

/* ── Hash a string to a deterministic integer ──────────────────── */
export function hashString(str) {
  let hash = 0
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

/* ── Relative time from ISO timestamp ──────────────────────────── */
export function timeAgo(iso) {
  if (!iso) return 'just now'
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000))
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hr ago`
  return `${Math.floor(hours / 24)} days ago`
}

/* ── Capitalize first letter ───────────────────────────────────── */
export function capitalize(str = '') {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/* ── Map a raw DB row to a UI-friendly incident object ─────────── */
export function mapIncident(inc) {
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

/* ── Status display metadata ───────────────────────────────────── */
export const STATUS_META = {
  pending:  { label: 'Pending',  className: 'chip-pending' },
  verified: { label: 'Verified', className: 'chip-responding' },
  solved:   { label: 'Solved',   className: 'chip-resolved' },
  rejected: { label: 'Rejected', className: 'chip-active' },
}
