import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { peso } from '../lib/utils'

export default function OrderForm({ sessionId, clientToken, onAdded }) {
  const [name, setName] = useState(() => localStorage.getItem('go_display_name') || '')
  const [orderName, setOrderName] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [price, setPrice] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [err, setErr] = useState('')

  const total = (Number(quantity) || 0) * (Number(price) || 0)

  function bumpQty(delta) {
    setQuantity((q) => Math.max(1, (Number(q) || 1) + delta))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (submitting) return // guards against double-tap submissions

    const trimmedName = name.trim()
    const trimmedOrder = orderName.trim()
    const qty = Number(quantity)
    const pr = Number(price)

    if (!trimmedName) return setErr('Enter your name.')
    if (!trimmedOrder) return setErr("Enter what you're ordering.")
    if (!qty || qty <= 0) return setErr('Quantity must be at least 1.')
    if (price === '' || pr < 0) return setErr('Enter a valid price.')

    setErr('')
    setSubmitting(true)

    const { error } = await supabase.from('orders').insert({
      session_id: sessionId,
      client_token: clientToken,
      name: trimmedName,
      order_name: trimmedOrder,
      quantity: qty,
      price: pr,
    })

    setSubmitting(false)

    if (error) {
      setErr('Could not add your order. Please try again.')
      return
    }

    localStorage.setItem('go_display_name', trimmedName)
    setOrderName('')
    setPrice('')
    setQuantity(1)
    onAdded?.()
  }

  return (
    <form className="card order-form" onSubmit={handleSubmit}>
      <h2 className="card-title">Add your order</h2>

      <label className="field">
        <span>Your name</span>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ralph" maxLength={40} />
      </label>

      <label className="field">
        <span>What do you want?</span>
        <input
          value={orderName}
          onChange={(e) => setOrderName(e.target.value)}
          placeholder="Chicken Inasal"
          maxLength={60}
        />
      </label>

      <div className="field-row">
        <label className="field field--qty">
          <span>Quantity</span>
          <div className="stepper">
            <button type="button" className="stepper-btn" onClick={() => bumpQty(-1)} aria-label="Decrease quantity">−</button>
            <input
              className="stepper-input"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              inputMode="numeric"
            />
            <button type="button" className="stepper-btn" onClick={() => bumpQty(1)} aria-label="Increase quantity">+</button>
          </div>
        </label>

        <label className="field field--price">
          <span>Price per item</span>
          <div className="price-input">
            <span className="price-prefix">₱</span>
            <input
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="150"
            />
          </div>
        </label>
      </div>

      <div className="live-total">
        Total: <strong>{peso(total)}</strong>
      </div>

      {err && <div className="alert">{err}</div>}

      <button className="btn btn--primary btn--block" type="submit" disabled={submitting}>
        {submitting ? 'Adding…' : '+ ADD ORDER'}
      </button>
    </form>
  )
}
