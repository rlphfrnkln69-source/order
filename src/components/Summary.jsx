import { useMemo } from 'react'
import { peso } from '../lib/utils'

export default function Summary({ orders }) {
  const stats = useMemo(() => {
    const people = new Set(orders.map((o) => o.name.trim().toLowerCase())).size
    const items = orders.reduce((sum, o) => sum + o.quantity, 0)
    const grandTotal = orders.reduce((sum, o) => sum + Number(o.total), 0)
    return { people, items, grandTotal }
  }, [orders])

  return (
    <section className="summary">
      <div className="summary-stat">
        <div className="summary-emoji">👥</div>
        <div className="summary-value">{stats.people}</div>
        <div className="summary-label">People</div>
      </div>
      <div className="summary-stat">
        <div className="summary-emoji">🍔</div>
        <div className="summary-value">{stats.items}</div>
        <div className="summary-label">Items</div>
      </div>
      <div className="summary-stat summary-stat--total">
        <div className="summary-emoji">💰</div>
        <div className="summary-value">{peso(stats.grandTotal)}</div>
        <div className="summary-label">Grand total</div>
      </div>
    </section>
  )
}
