import { useState, useMemo } from 'react'
import { supabase } from '../supabaseClient'
import { peso } from '../lib/utils'

export default function OrderForm({ sessionId, clientToken, menuItems, onAdded, onRefresh }) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState(null)
  const [selectedItem, setSelectedItem] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [err, setErr] = useState('')

  const available = useMemo(() => menuItems.filter((m) => m.is_available), [menuItems])

  const categories = useMemo(() => {
    const seen = []
    for (const item of available) {
      if (!seen.includes(item.category)) seen.push(item.category)
    }
    return seen
  }, [available])

  const activeCategory = category ?? categories[0] ?? null
  const itemsInCategory = available.filter((m) => m.category === activeCategory)

  const total = selectedItem ? selectedItem.price * (Number(quantity) || 0) : 0

  function bumpQty(delta) {
    setQuantity((q) => Math.max(1, (Number(q) || 1) + delta))
  }

  function selectItem(item) {
    setSelectedItem(item)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (submitting) return
    const trimmedName = name.trim()
    const qty = Number(quantity)
    if (!trimmedName) return setErr('Enter your name.')
    if (!selectedItem) return setErr('Pick an item from the menu.')
    if (!qty || qty <= 0) return setErr('Quantity must be at least 1.')
    if (qty > 999) return setErr('Quantity seems too high — max 999.')

    setErr('')
    setSubmitting(true)
    const { error } = await supabase.from('orders').insert({
      session_id: sessionId,
      client_token: clientToken,
      name: trimmedName,
      order_name: selectedItem.name,
      quantity: qty,
      price: selectedItem.price,
    })
    setSubmitting(false)
    if (error) {
      setErr('Could not add your order. Please try again.')
      return
    }
    setSelectedItem(null)
    setQuantity(1)
    onAdded?.()
    onRefresh?.()
  }

  if (menuItems.length === 0) {
    return (
      <div className="card">
        <h2 className="card-title">Add your order</h2>
        <div className="muted center">No menu yet — ask the organizer to add items first.</div>
      </div>
    )
  }

  return (
    <form className="card order-form" onSubmit={handleSubmit}>
      <h2 className="card-title">Add your order</h2>
      <label className="field">
        <span>Your name</span>
        <input value={name} onChange={(e) => setName(e.target.value)} maxLength={40} />
      </label>

      {categories.length > 1 && (
        <div className="tabs" style={{ marginBottom: 12 }}>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`tab ${activeCategory === cat ? 'tab--active' : ''}`}
              onClick={() => { setCategory(cat); setSelectedItem(null) }}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      <div className="menu-item-list">
        {itemsInCategory.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`menu-item-row ${selectedItem?.id === item.id ? 'menu-item-row--selected' : ''}`}
            onClick={() => selectItem(item)}
          >
            <span className="menu-item-name">{item.name}</span>
            <span className="menu-item-price">{peso(item.price)}</span>
          </button>
        ))}
        {itemsInCategory.length === 0 && (
          <div className="muted center" style={{ padding: '12px 0' }}>Nothing available in this category.</div>
        )}
      </div>

      {selectedItem && (
        <>
          <label className="field field--qty" style={{ marginTop: 14 }}>
            <span>Quantity</span>
            <div className="stepper">
              <button type="button" className="stepper-btn" onClick={() => bumpQty(-1)} aria-label="Decrease quantity">−</button>
              <input
                className="stepper-input"
                type="number"
                min="1"
                max="999"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                inputMode="numeric"
              />
              <button type="button" className="stepper-btn" onClick={() => bumpQty(1)} aria-label="Increase quantity">+</button>
            </div>
          </label>
          <div className="live-total">
            Total: <strong>{peso(total)}</strong>
          </div>
        </>
      )}

      {err && <div className="alert">{err}</div>}
      <button className="btn btn--primary btn--block" type="submit" disabled={submitting || !selectedItem}>
        {submitting ? 'Adding…' : '+ ADD ORDER'}
      </button>
    </form>
  )
}
