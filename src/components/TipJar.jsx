import { useState } from 'react'
import { Heart } from 'lucide-react'
import gcashQr from '../asset/gcash-qr.png'
import mayaQr from '../asset/maya-qr.png'

export default function TipJar({ onToast }) {
  const [open, setOpen] = useState(false)

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

            <div className="tipjar-qr-row">
              <div className="tipjar-qr-item">
                <img src={gcashQr} alt="GCash QR" className="tipjar-qr-img" />
                <div className="muted" style={{ fontSize: 12, textAlign: 'center' }}>GCash</div>
              </div>
              <div className="tipjar-qr-item">
                <img src={mayaQr} alt="Maya QR" className="tipjar-qr-img" />
                <div className="muted" style={{ fontSize: 12, textAlign: 'center' }}>Maya</div>
              </div>
            </div>

            <div className="tipjar-list">
              <div className="tipjar-row">
                <div>
                  <div className="tipjar-label">PayPal</div>
                  <div className="tipjar-value">vallejosfranklin98@gmail.com</div>
                </div>
                <button className="btn btn--outline" onClick={() => copyValue('vallejosfranklin98@gmail.com')}>Copy</button>
              </div>
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
