import { useMemo } from 'react'
import { peso } from '../lib/utils'

export default function PeopleTab({ orders }) {
  const people = useMemo(() => {
    const map = new Map()
    for (const o of orders) {
      const key = o.name.trim().toLowerCase()
      if (!map.has(key)) {
        map.set(key, { name: o.name.trim(), total: 0, hasUnpaid: false })
      }
      const entry = map.get(key)
      entry.total += Number(o.total)
      if (!o.paid) entry.hasUnpaid = true
    }
    return Array.from(map.values()).sort((a, b) => b.total - a.total)
  }, [orders])

  if (people.length === 0) {
    return <div className="muted center">No one has ordered yet.</div>
  }

  return (
    <div className="dash-person-list">
      {people.map((p) => (
        <div key={p.name} className="dash-person-row">
          <span className="dash-person-name">{p.name}</span>
          <div style={{ textAlign: 'right' }}>
            <div className="dash-person-total">{peso(p.total)}</div>
            <div className={`pill ${p.hasUnpaid ? 'pill--unpaid' : 'pill--paid'}`} style={{ marginTop: 2 }}>
              {p.hasUnpaid ? 'Unpaid' : 'Paid'}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
