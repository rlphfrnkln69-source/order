import { useEffect, useState, useCallback } from 'react'
import { Trash2 } from 'lucide-react'
import { supabase } from '../supabaseClient'
import { peso } from '../lib/utils'

export default function AdminMenu() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('')
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState('')

  const fetchItems = useCallback(async () => {
    const { data, error } = await supabase
      .from('restaurant_menu_items')
      .select('*')
      .order('created_at', { ascending: true })
    if (!error) setItems(data)
    setLoading(false)
  }, [])

  useEffect(() => { fetchItems() }, [fetchItems])

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 2200)
  }

  async function handleAdd(e) {
    e.preventDefault()
    const trimmedCategory = category.trim() || 'Menu'
    const trimmedName = name.trim()
    const pr = Number(price)
    if (!trimmedName) return showToast('Enter an item name.')
    if (!price || pr < 0) return showToast('Enter a valid price.')

    setSubmitting(true)
    const { error } = await supabase.from('restaurant_menu_items').insert({
      category: trimmedCategory,
      name: trimmedName,
      price: pr,
    })
    setSubmitting(false)
    if (error) return showToast('Could not add item.')
    setName('')
    setPrice('')
    fetchItems()
  }

  async function toggleAvailable(item) {
    const { error } = await supabase
      .from('restaurant_menu_items')
      .update({ is_available: !item.is_available })
      .eq('id', item.id)
    if (!error) fetchItems()
  }

  async function deleteItem(item) {
    if (!confirm(`Remove "${item.name}" from the menu?`)) return
    const { error } = await supabase.from('restaurant_menu_items').delete().eq('id', item.id)
    if (!error) fetchItems()
  }

  const grouped = groupByCategory(items)

  return (
    <div style={{ marginTop: 16 }}>
      <form className="card" onSubmit={handleAdd}>
        <h2 className="card-title">Add menu item</h2>
        <label className="field">
          <span>Category</span>
          <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Mains, Drinks" maxLength={40} />
        </label>
        <label className="field">
          <span>Item name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={60} />
        </label>
        <label className="field">
          <span>Price</span>
          <div className="price-input">
            <span className="price-prefix">₱</span>
            <input type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>
        </label>
        <button className="btn btn--primary btn--block" type="submit" disabled={submitting}>
          {submitting ? 'Adding…' : '+ Add item'}
        </button>
      </form>

      {toast && <div className="toast">{toast}</div>}

      {loading && <div className="muted center">Loading menu…</div>}
      {!loading && items.length === 0 && (
        <div className="muted center">No menu items yet — add your first one above.</div>
      )}

      {grouped.map(([cat, catItems]) => (
        <div key={cat} style={{ marginTop: 16 }}>
          <div className="dash-subhead">{cat}</div>
          <div className="dash-person-list">
            {catItems.map((item) => (
              <div key={item.id} className="dash-person-row">
                <div>
                  <div className="dash-person-name">{item.name}</div>
                  <div className="muted" style={{ fontSize: 13 }}>{peso(item.price)}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <button
                    className={`pill pill--clickable ${item.is_available ? 'pill--paid' : 'pill--unpaid'}`}
                    onClick={() => toggleAvailable(item)}
                  >
                    {item.is_available ? 'Available' : 'Sold out'}
                  </button>
                  <button className="icon-btn icon-btn--danger" onClick={() => deleteItem(item)} aria-label="Delete item">
                    <Trash2 size={14} strokeWidth={2} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function groupByCategory(items) {
  const map = new Map()
  for (const item of items) {
    if (!map.has(item.category)) map.set(item.category, [])
    map.get(item.category).push(item)
  }
  return Array.from(map.entries())
}
