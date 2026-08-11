import { useEffect, useState, useMemo, useCallback } from 'react'
import { supabase } from '../supabaseClient'
import { MapPin, Share2, FileDown, LayoutDashboard, Lock } from 'lucide-react'
import OrderForm from './OrderForm.jsx'
import OrderList from './OrderList.jsx'
import Summary from './Summary.jsx'
import PeopleTab from './PeopleTab.jsx'
import BottomNav from './BottomNav.jsx'
import OrganizerDashboard from './OrganizerDashboard.jsx'
import PrintableReport from './PrintableReport.jsx'
import TipJar from './TipJar.jsx'

export default function SessionView({ session, clientToken, onSessionUpdated, onLeave }) {
  const [orders, setOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [toast, setToast] = useState('')
  const [renaming, setRenaming] = useState(false)
  const [nameDraft, setNameDraft] = useState(session.session_name)
  const [showDashboard, setShowDashboard] = useState(false)
  const [activeTab, setActiveTab] = useState('orders')

  const isOrganizer = useMemo(() => {
    return localStorage.getItem(`go_organizer_${session.id}`) === session.organizer_token
  }, [session.id, session.organizer_token])

  const fetchOrders = useCallback(async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('session_id', session.id)
      .order('created_at', { ascending: true })
    if (!error) setOrders(data)
    setLoadingOrders(false)
  }, [session.id])

  useEffect(() => {
    fetchOrders()

    const channel = supabase
      .channel(`session-${session.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `session_id=eq.${session.id}` }, () => {
        fetchOrders()
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'sessions', filter: `id=eq.${session.id}` }, (payload) => {
        onSessionUpdated(payload.new)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.id])

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 2200)
  }

  async function handleShare() {
    const url = new URL(window.location.href)
    url.searchParams.set('s', session.session_code)
    const shareUrl = url.toString()
    try {
      if (navigator.share) {
        await navigator.share({ title: session.session_name, text: 'Join our GroupOrder!', url: shareUrl })
      } else {
        await navigator.clipboard.writeText(shareUrl)
        showToast('Link copied!')
      }
    } catch {
      // user cancelled share sheet — no-op
    }
  }

  async function handleRename() {
    const trimmed = nameDraft.trim()
    if (!trimmed || trimmed === session.session_name) {
      setRenaming(false)
      setNameDraft(session.session_name)
      return
    }
    const { data, error } = await supabase
      .from('sessions')
      .update({ session_name: trimmed })
      .eq('id', session.id)
      .select()
      .single()
    if (!error) {
      onSessionUpdated(data)
      showToast('Session renamed')
    }
    setRenaming(false)
  }

  async function handleCloseSession() {
    if (!confirm('Close this session? No new orders can be added, but everyone can still view it.')) return
    const { data, error } = await supabase
      .from('sessions')
      .update({ status: session.status === 'closed' ? 'open' : 'closed' })
      .eq('id', session.id)
      .select()
      .single()
    if (!error) {
      onSessionUpdated(data)
      showToast(data.status === 'closed' ? 'Session closed' : 'Session reopened')
    }
  }

  function handleDownloadPdf() {
    window.print()
  }

  const isClosed = session.status === 'closed'

  return (
    <>
      <div className="screen app-ui app-ui--tabbed">
        <header className="topbar">
          <button className="link-btn" onClick={onLeave}>← New / switch session</button>
        </header>

        <section className="session-card">
          <div className="session-card-row">
            {renaming ? (
              <input
                className="session-rename-input"
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                onBlur={handleRename}
                onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                autoFocus
              />
            ) : (
              <h1 className="session-title" onClick={() => isOrganizer && setRenaming(true)}>
                {session.session_name}
                {isOrganizer && <span className="edit-hint">✎</span>}
              </h1>
            )}
            {isClosed && <span className="badge badge--closed">CLOSED</span>}
          </div>
          {session.restaurant_name && (
            <p className="session-sub">
              <MapPin size={14} strokeWidth={2} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 4 }} />
              {session.restaurant_name}
            </p>
          )}
          {session.notes && <p className="session-sub session-notes">{session.notes}</p>}
          <div className="session-code-row">
            <span className="muted">Code</span>
            <span className="session-code">{session.session_code}</span>
          </div>
        </section>

        {activeTab === 'orders' && (
          <>
            {!isClosed && (
              <OrderForm
                sessionId={session.id}
                clientToken={clientToken}
                onAdded={() => showToast('Order added!')}
                onRefresh={fetchOrders}
              />
            )}
            {isClosed && (
              <div className="alert alert--info">This session is closed. Orders can no longer be added or edited.</div>
            )}
            <OrderList
              orders={orders}
              loading={loadingOrders}
              clientToken={clientToken}
              isOrganizer={isOrganizer}
              isClosed={isClosed}
              onToast={showToast}
              onRefresh={fetchOrders}
            />
          </>
        )}

        {activeTab === 'summary' && <Summary orders={orders} />}

        {activeTab === 'people' && <PeopleTab orders={orders} />}

        {activeTab === 'more' && (
          <>
            <div className="action-row" style={{ marginTop: 0 }}>
              <button className="btn btn--secondary btn--block" onClick={handleShare}>
                <Share2 size={16} strokeWidth={2} style={{ verticalAlign: '-3px', marginRight: 6 }} />Share session
              </button>
              <button className="btn btn--outline btn--block" onClick={handleDownloadPdf}>
                <FileDown size={16} strokeWidth={2} style={{ verticalAlign: '-3px', marginRight: 6 }} />Download PDF
              </button>
              {isOrganizer && (
                <button className="btn btn--outline btn--block" onClick={() => setShowDashboard(true)}>
                  <LayoutDashboard size={16} strokeWidth={2} style={{ verticalAlign: '-3px', marginRight: 6 }} />Organizer dashboard
                </button>
              )}
              {isOrganizer && (
                <button className="btn btn--outline btn--block" onClick={handleCloseSession}>
                  <Lock size={16} strokeWidth={2} style={{ verticalAlign: '-3px', marginRight: 6 }} />
                  {isClosed ? 'Reopen session' : 'Close session'}
                </button>
              )}
            </div>
            <TipJar onToast={showToast} />
          </>
        )}

        {toast && <div className="toast">{toast}</div>}
        {showDashboard && <OrganizerDashboard orders={orders} onClose={() => setShowDashboard(false)} />}
      </div>

      <BottomNav active={activeTab} onChange={setActiveTab} />

      <PrintableReport session={session} orders={orders} />
    </>
  )
}
