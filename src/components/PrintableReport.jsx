import { useMemo } from 'react'
import { peso, formatDateTime } from '../lib/utils'

export default function PrintableReport({ session, orders }) {
  const byPerson = useMemo(() => {
    const map = new Map()
    for (const o of orders) {
      const key = o.name.trim()
      if (!map.has(key)) map.set(key, { name: key, items: [], total: 0 })
      const bucket = map.get(key)
      bucket.items.push(o)
      bucket.total += Number(o.total)
    }
    return [...map.values()]
  }, [orders])

  const grandTotal = orders.reduce((sum, o) => sum + Number(o.total), 0)

  return (
    <div className="printable">
      <h1 className="printable-title">{session.session_name}</h1>
      {session.restaurant_name && <p className="printable-sub">📍 {session.restaurant_name}</p>}
      {session.notes && <p className="printable-sub">{session.notes}</p>}
      <p className="printable-sub">Generated {formatDateTime(new Date().toISOString())}</p>

      <table className="printable-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Order</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Total</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td>{o.name}</td>
              <td>{o.order_name}</td>
              <td>{o.quantity}</td>
              <td>{peso(o.price)}</td>
              <td>{peso(o.total)}</td>
              <td>{o.payment_status === 'paid' ? 'Paid' : 'Unpaid'}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={4} className="printable-total-label">GRAND TOTAL</td>
            <td colSpan={2} className="printable-total-value">{peso(grandTotal)}</td>
          </tr>
        </tfoot>
      </table>

      <h2 className="printable-section-title">Per person</h2>
      <table className="printable-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Items</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {byPerson.map((p) => (
            <tr key={p.name}>
              <td>{p.name}</td>
              <td>{p.items.length}</td>
              <td>{peso(p.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
