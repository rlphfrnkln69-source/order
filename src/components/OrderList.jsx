import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { peso } from '../lib/utils'

function OrderRow({ order, canManage, isOrganizer, isClosed, onToast, onRefresh }) {
  const [editing, setEditing] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [draft, setDraft] = useState({
    name: order.name,
    order_name: order.order_name,
    quantity: order.quantity,
    price: order.price,
  })
  const [busy, setBusy] = useState(false)

  async function saveEdit() {
    const qty = Number(draft.quantity)
    const pr = Number(draft.price)
    if (
      !draft.name.trim() ||
      !draft.order_name.trim() ||
      !qty ||
      qty <= 0 ||
      qty > 999 ||
      pr < 0 ||
      pr > 999999
    ) {
      onToast("Check the order details — they don't look right.")
      return
    }
    setBusy(true)
    const { error } = await supabase
      .from('orders')
      .update({
        name: draft.name.trim(),
        order_name: draft.order_name.trim(),
        quantity: qty,
        price: pr,
      })
      .eq('id', order.id)
    setBusy(false)
    if (error) {
      onToast('Could not save changes.')
      return
    }
    setEditing(false)
    onToast('Order updated')
    onRefresh?.()
  }

  async function doDelete() {
    setBusy(true)
    const { error } = await supabase.from('orders').delete().eq('id', order.id)
    setBusy(false)
    setConfirmingDelete(false)
    if (error) onToast('Could not delete order.')
    else {
      onToast('Order deleted')
      onRefresh?.()
    }
  }

  async function togglePaid() {
    const next = order.payment_status === 'paid' ? 'unpaid' : 'paid'
    const { error } = await supabase.from('orders').update({ payment_status: next }).eq('id', order.id)
    if (error) onToast('Could not update payment status.')
    else onRefresh?.()
  }

  if (editing) {
    return (
      <div className="ticket ticket--editing">
        <input
          className="ticket-edit-input"
          value={draft.name}
          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          placeholder="Name"
        />
        <input
          className="ticket-edit-input"
          value={draft.order_name}
          onChange={(e) => setDraft({ ...draft, order_name: e.target.value })}
          placeholder="Order"
        />
        <div className="ticket-edit-row">
          <input
            className="ticket-edit-input ticket-edit-input--small"
            type="number"
            min="1"
            max="999"
            value={draft.quantity}
            onChange={(e) => setDraft({ ...draft, quantity: e.target.value })}
            placeholder="Qty"
          />
          <input
            className="ticket-edit-input ticket-edit-input--small"
            type="number"
            min="0"
            max="999999"
            step="0.01"
            value={draft.price}
            onChange={(e) => setDraft({ ...draft, price: e.target.value })}
            placeholder="Price"
          />
        </div>
        <div className="ticket-edit-actions">
          <button className="btn btn--outline" onClick={() => setEditing(false)} disabled={busy}>Cancel</button>
          <button className="btn btn--primary" onClick={saveEdit} disabled={busy}>Save</button>
        </div>
      </div>
    )
  }

  return (
    <div className={`ticket ${order.payment_status === 'paid' ? 'ticket--paid' : ''}`}>
      <div className="ticket-main">
        <div className="ticket-who">{order.name}</div>
        <div className="ticket-item">
          {order.order_name} <span className="ticket-qty">× {order.quantity}</span>
        </div>
      </div>
      <div className="ticket-side">
        <div className="ticket-total">{peso(order.total)}</div>
        <button
          className={`pill ${order.payment_status === 'paid' ? 'pill--paid' : 'pill--unpaid'} ${isOrganizer ? 'pill--clickable' : ''}`}
          onClick={isOrganizer ? togglePaid : undefined}
          disabled={!isOrganizer}
          title={isOrganizer ? 'Tap to toggle payment status' : ''}
        >
          {order.payment_status === 'paid' ? '🟢 Paid' : '🟡 Unpaid'}
        </button>
      </div>
      {canManage && !isClosed && (
        <div className="ticket-actions">
          <button className="icon-btn" onClick={() => setEditing(true)} aria-label="Edit order">✎</button>
          <button className="icon-btn icon-btn--danger" onClick={() => setConfirmingDelete(true)} aria-label="Delete order">🗑</button>
        </div>
      )}

      {confirmingDelete && (
        <div className="modal-backdrop" onClick={() => setConfirmingDelete(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <p>Are you sure you want to delete this order?</p>
            <p className="muted">{order.name} — {order.order_name} × {order.quantity}</p>
            <div className="modal-actions">
              <button className="btn btn--outline btn--block" onClick={() => setConfirmingDelete(false)} disabled={busy}>Cancel</button>
              <button className="btn btn--danger btn--block" onClick={doDelete} disabled={busy}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function OrderList({ orders, loading, clientToken, isOrganizer, isClosed, onToast, onRefresh }) {
  if (loading) {
    return <p className="muted center">Loading orders…</p>
  }

  if (orders.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-emoji">🍽️</div>
        <p>No orders yet — be the first to add one above.</p>
      </div>
    )
  }

  return (
    <section>
      <h2 className="card-title">Current orders</h2>
      <div className="ticket-list">
        {orders.map((order) => (
          <OrderRow
            key={order.id}
            order={order}
            canManage={isOrganizer || order.client_token === clientToken}
            isOrganizer={isOrganizer}
            isClosed={isClosed}
            onToast={onToast}
            onRefresh={onRefresh}
          />
        ))}
      </div>
    </section>
  )
}
