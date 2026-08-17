import { useEffect, useState, useCallback } from 'react'
import { supabase } from './supabaseClient'
import { getOrCreateClientToken } from './lib/utils'
import SessionSetup from './components/SessionSetup.jsx'
import SessionView from './components/SessionView.jsx'
import AdminApp from './components/AdminApp.jsx'

function getCodeFromUrl() {
  const params = new URLSearchParams(window.location.search)
  return params.get('s')
}

function isAdminRoute() {
  return new URLSearchParams(window.location.search).get('admin') === '1'
}

export default function App() {
  const [clientToken] = useState(getOrCreateClientToken)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadSessionByCode = useCallback(async (code) => {
    setLoading(true)
    setError('')
    const { data, error: err } = await supabase
      .from('sessions')
      .select('*')
      .eq('session_code', code.toUpperCase())
      .maybeSingle()
    if (err) {
      setError("Couldn't load that session. Check your connection and try again.")
    } else if (!data) {
      setError(`No session found for code "${code.toUpperCase()}".`)
      window.history.replaceState({}, '', window.location.pathname)
    } else {
      setSession(data)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (isAdminRoute()) {
      setLoading(false)
      return
    }
    const code = getCodeFromUrl()
    if (code) {
      loadSessionByCode(code)
    } else {
      setLoading(false)
    }
  }, [loadSessionByCode])

  function handleSessionReady(newSession) {
    setSession(newSession)
    setError('')
    const url = new URL(window.location.href)
    url.searchParams.set('s', newSession.session_code)
    window.history.replaceState({}, '', url)
  }

  function handleLeaveSession() {
    setSession(null)
    window.history.replaceState({}, '', window.location.pathname)
  }

  if (isAdminRoute()) {
    return <AdminApp />
  }

  if (loading) {
    return (
      <div className="screen screen--center">
        <div className="brand-mark">🍴</div>
        <p className="muted">Loading…</p>
      </div>
    )
  }

  return session ? (
    <SessionView
      session={session}
      clientToken={clientToken}
      onSessionUpdated={setSession}
      onLeave={handleLeaveSession}
    />
  ) : (
    <SessionSetup
      clientToken={clientToken}
      onSessionReady={handleSessionReady}
      loadError={error}
      onJoinByCode={loadSessionByCode}
    />
  )
}
