import { useCallback, useRef, useState } from 'react'

const THRESHOLD = 80
const MAX_PULL = 120

/**
 * PullToRefresh — native-feeling pull-to-refresh for touch devices.
 * Wraps children and fires `onRefresh` when pulled past threshold.
 */
export default function PullToRefresh({ onRefresh, children }) {
  const [pullDistance, setPullDistance] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const containerRef = useRef(null)
  const touchStartY = useRef(0)
  const isPulling = useRef(false)

  const handleTouchStart = useCallback((e) => {
    const el = containerRef.current
    if (!el || refreshing) return
    // Only activate when scrolled to top
    if (el.scrollTop > 5) return
    touchStartY.current = e.touches[0].clientY
    isPulling.current = true
  }, [refreshing])

  const handleTouchMove = useCallback((e) => {
    if (!isPulling.current) return
    const dy = e.touches[0].clientY - touchStartY.current
    if (dy <= 0) {
      setPullDistance(0)
      return
    }
    // Rubber-band resistance
    const distance = Math.min(MAX_PULL, dy * 0.5)
    setPullDistance(distance)
  }, [])

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling.current) return
    isPulling.current = false

    if (pullDistance >= THRESHOLD && onRefresh) {
      setRefreshing(true)
      setPullDistance(THRESHOLD)
      try {
        await onRefresh()
      } catch {
        // ignore refresh errors
      }
      setRefreshing(false)
    }
    setPullDistance(0)
  }, [pullDistance, onRefresh])

  const progress = Math.min(pullDistance / THRESHOLD, 1)
  const showIndicator = pullDistance > 5 || refreshing

  return (
    <div
      ref={containerRef}
      className="ptr-container"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className={`ptr-indicator ${showIndicator ? 'visible' : ''} ${refreshing ? 'refreshing' : ''}`}
        style={{
          height: pullDistance || (refreshing ? THRESHOLD * 0.6 : 0),
          opacity: showIndicator ? 1 : 0,
        }}
      >
        <span
          className="ptr-spinner"
          style={{
            transform: `rotate(${progress * 360}deg) scale(${0.6 + progress * 0.4})`,
          }}
        >
          {refreshing ? '⏳' : '🔄'}
        </span>
        <span className="ptr-text">
          {refreshing
            ? 'Refreshing…'
            : pullDistance >= THRESHOLD
              ? 'Release to refresh'
              : 'Pull to refresh'}
        </span>
      </div>
      {children}
    </div>
  )
}
