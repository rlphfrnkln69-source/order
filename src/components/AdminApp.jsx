import { useEffect, useState } from 'react'
import { LogOut } from 'lucide-react'
import { supabase } from '../supabaseClient'
import AdminLogin from './AdminLogin.jsx'
import AdminMenu from './AdminMenu.jsx'
import AdminPayments from './AdminPayments.jsx'

export default function AdminApp() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('menu')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
  }

  if (loading) {
    return (
      <div className="screen screen--center">
        <p className="muted">Loading…</p>
      </div>
    )
  }

  if (!session) return <AdminLogin />

  return (
    <div className="screen">
      <header className="topbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="session-title" style={{ fontSize: 20 }}>Admin</h1>
        <button className="link-btn" onClick={handleLogout}>
          <LogOut size={14} strokeWidth={2} style={{ verticalAlign: '-2px', marginRight: 4 }} />
          Log out
        </button>
      </header>

      <div className="tabs" style={{ marginTop: 12 }}>
        <button className={`tab ${tab === 'menu' ? 'tab--active' : ''}`} onClick={() => setTab('menu')}>Menu</button>
        <button className={`tab ${tab === 'payments' ? 'tab--active' : ''}`} onClick={() => setTab('payments')}>Payments</button>
      </div>

      {tab === 'menu' && <AdminMenu />}
      {tab === 'payments' && <AdminPayments />}
    </div>
  )
}
