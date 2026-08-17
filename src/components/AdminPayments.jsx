import { useEffect, useState, useCallback } from 'react'
import { Trash2 } from 'lucide-react'
import { supabase } from '../supabaseClient'

export default function AdminPayments() {
  const [methods, setMethods] = useState([])
  const [loading, setLoading] = useState(true)
  const [label, setLabel] = useState('')
  const [accountValue, setAccountValue] = useState('')
  const [note, setNote] = useState('')
  const [qrUrl, setQrUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState('')

  const fetchMethods = useCallback(async () => {
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .order('sort_order', { ascending: true })
    if (!error) setMethods(data)
    setLoading(false)
  }, [])

  useEffect(() => { fetchMethods() }, [fetchMethods])

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 2200)
  }

  async function handleAdd(e) {
    e.preventDefault()
    const trimmedLabel = label.trim()
    const trimmedValue = accountValue.trim()
    if (!trimmedLabel) return showToast('Enter a label, e.g. GCash.')
    if (!trimmedValue) return showToast('Enter the account number or email.')

    setSubmitting(true)
    const { error } = await supabase.from('payment_methods').insert({
      label: trimmedLabel,
      account_value: trimmedValue,
      note: note.trim() || null,
      qr_image_url: qrUrl.trim() || null,
      sort_order: methods.length,
    })
    setSubmitting(false)
    if (error) return showToast('Could not add payment method.')
    setLabel('')
    setAccountValue('')
    setNote('')
    setQrUrl('')
    fetchMethods()
  }

  async function deleteMethod(m) {
    if (!confirm(`Remove ${m.label}?`)) return
    const { error } = await supabase.from('payment_methods').delete().eq('id', m.id)
    if (!error) fetchMethods()
  }

  return (
    <div style={{ marginTop: 16 }}>
      <form className="card" onSubmit={handleAdd}>
        <h2 className="card-title">Add payment method</h2>
        <label className="field">
          <span>Label</span>
          <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. GCash, PayPal" maxLength={40} />
        </label>
        <label className="field">
          <span>Account number / email</span>
          <input value={accountValue} onChange={(e) => setAccountValue(e.target.value)} maxLength={80} />
        </label>
        <label className="field">
          <span>Account name <em>(optional)</em></span>
          <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={80} />
        </label>
        <label className="field">
          <span>QR image URL <em>(optional)</em></span>
          <input value={qrUrl} onChange={(e) => setQrUrl(e.target.value)} placeholder="https://…" maxLength={300} />
        </label>
        <button className="btn btn--primary btn--block" type="submit" disabled={submitting}>
          {submitting ? 'Adding…' : '+ Add payment method'}
        </button>
      </form>

      {toast && <div className="toast">{toast}</div>}

      {loading && <div className="muted center">Loading payment methods…</div>}
      {!loading && methods.length === 0 && (
        <div className="muted center">No payment methods yet — add one above.</div>
      )}

      <div className="dash-person-list" style={{ marginTop: 16 }}>
        {methods.map((m) => (
          <div key={m.id} className="dash-person-row">
            <div>
              <div className="dash-person-name">{m.label}</div>
              <div className="muted" style={{ fontSize: 13 }}>{m.account_value}</div>
              {m.note && <div className="muted" style={{ fontSize: 12 }}>{m.note}</div>}
            </div>
            <button className="icon-btn icon-btn--danger" onClick={() => deleteMethod(m)} aria-label="Delete">
              <Trash2 size={14} strokeWidth={2} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
