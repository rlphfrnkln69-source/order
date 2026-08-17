import { useEffect, useState } from 'react'
import { Heart } from 'lucide-react'
import { supabase } from '../supabaseClient'

export default function TipJar({ onToast }) {
  const [open, setOpen] = useState(false)
  const [methods, setMethods] = useState([])

  useEffect(() => {
    if (!open) return
    supabase
      .from('payment_methods')
      .select('*')
      .order('sort_order', { ascending: true })
      .then(({ data, error }) => {
        if (!error) setMethods(data)
      })
  }, [open])

  async function copyValue(value) {
    try {
      await navigator.clipboard.writeText(value)
      onToast?.('Copied!')
    } catch {
      // clipboard unavailable — no-op
    }
  }

  return (
    <>
      <button className="tipjar-trigger" onClick={() => setOpen(true)}>
        <Heart size={12} strokeWidth={2} style={{ verticalAlign: '-2px', marginRight: 4 }} />
        Support the developer
      </button>

      {open && (
        <div className="modal-backdrop" onClick={() => setOpen(false)}>
          <div className="modal modal--tall" onClick={(e) => e.stopPropagation()}>
            <p>Enjoying GroupOrder? A small tip helps keep it running.</p>

            {methods.length === 0 && (
              <div className="muted center">No payment methods set up yet.</div>
            )}

            {methods.some((m) => m.qr_image_url) && (
              <div className="tipjar-qr-row">
                {methods.filter((m) => m.qr_image_url).map((m) => (
                  <div key={m.id} className="tipjar-qr-item">
                    <img src={m.qr_image_url} alt={`${m.label} QR`} className="tipjar-qr-img" />
                    <div className="muted" style={{ fontSize: 12, textAlign: 'center' }}>{m.label}</div>
                  </div>
                ))}
              </div>
            )}

            <div className="tipjar-list">
              {methods.filter((m) => !m.qr_image_url).map((m) => (
                <div key={m.id} className="tipjar-row">
                  <div>
                    <div className="tipjar-label">{m.label}</div>
                    <div className="tipjar-value">{m.account_value}</div>
                    {m.note && <div className="muted" style={{ fontSize: 12 }}>{m.note}</div>}
                  </div>
                  <button className="btn btn--outline" onClick={() => copyValue(m.account_value)}>Copy</button>
                </div>
              ))}
            </div>

            <div className="modal-actions">
              <button className="btn btn--outline btn--block" onClick={() => setOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
