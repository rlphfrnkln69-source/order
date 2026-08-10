import { useMemo } from 'react'
import { peso, timeAgo } from '../lib/utils'

export default function OrganizerDashboard({ orders, onClose }) {
  const byPerson = useMemo(() => {
    const map = new Map()
    for (const o of orders) {
      const key = o.name.trim()
      if (!map.has(key)) map.set(key, { name: key, items: [], total: 0, allPaid: true })
      const bucket = map.get(key)
      bucket.items.push(o)
      bucket.total += Number(o.total)
      if (o.payment_status !== 'paid') bucket.allPaid = false
    }
    return [...map.values()].sort((a, b) => b.total - a.total)
  }, [orders])

  const recentActivity = useMemo(() => {
    return [...orders].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 15)
  }, [orders])

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal--tall" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="card-title" style={{ margin: 0 }}>Organizer dashboard</h2>
          <button className="link-btn" onClick={onClose}>Close</button>
        </div>

        <h3 className="dash-subhead">Per person</h3>
        {byPerson.length === 0 && <p className="muted">No orders yet.</p>}
        <div className="dash-person-list">
          {byPerson.map((p) => (
            <div key={p.name} className="dash-person-row">
              <div>
                <div className="dash-person-name">{p.name}</div>
                <div className="muted" style={{ fontSize: 12 }}>{p.items.length} item{p.items.length > 1 ? 's' : ''}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="dash-person-total">{peso(p.total)}</div>
                <span className={`pill ${p.allPaid ? 'pill--paid' : 'pill--unpaid'}`}>
                  {p.allPaid ? '🟢 Paid' : '🟡 Unpaid'}
                </span>
              </div>
            </div>
          ))}
        </div>

        <h3 className="dash-subhead">Recent activity</h3>
        {recentActivity.length === 0 && <p className="muted">Nothing added yet.</p>}
        <div className="dash-activity-list">
          {recentActivity.map((o) => (
            <div key={o.id} className="dash-activity-row">
              <span><strong>{o.name}</strong> added {o.order_name} × {o.quantity}</span>
              <span className="muted" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>{timeAgo(o.created_at)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
