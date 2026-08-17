import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { generateSessionCode, generateToken } from '../lib/utils'

export default function SessionSetup({ clientToken, onSessionReady, loadError, onJoinByCode }) {
  const [mode, setMode] = useState('create') // 'create' | 'join'
  const [sessionName, setSessionName] = useState('')
  const [notes, setNotes] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  async function handleCreate(e) {
    e.preventDefault()
    if (!sessionName.trim()) {
      setErr('Give this group a name.')
      return
    }
    setBusy(true)
    setErr('')

    const organizerToken = generateToken()
    let code = generateSessionCode()

    // Retry once on the rare chance of a code collision.
    for (let attempt = 0; attempt < 3; attempt++) {
      const { data, error } = await supabase
        .from('sessions')
        .insert({
          session_code: code,
          session_name: sessionName.trim(),
          notes: notes.trim() || null,
          organizer_token: organizerToken,
        })
        .select()
        .single()

      if (!error) {
        localStorage.setItem(`go_organizer_${data.id}`, organizerToken)

        // Copy the current restaurant menu into this new session.
        const { data: masterMenu } = await supabase
          .from('restaurant_menu_items')
          .select('category, name, price, is_available')
        if (masterMenu?.length) {
          await supabase.from('menu_items').insert(
            masterMenu.map((item) => ({ ...item, session_id: data.id }))
          )
        }

        onSessionReady(data)
        setBusy(false)
        return
      }
      if (error.code === '23505') {
        code = generateSessionCode() // code collision, try a fresh one
        continue
      }
      setErr('Could not create the session. Please try again.')
      setBusy(false)
      return
    }
    setErr('Could not create the session. Please try again.')
    setBusy(false)
  }

  async function handleJoin(e) {
    e.preventDefault()
    if (!joinCode.trim()) {
      setErr('Enter the session code your friend shared with you.')
      return
    }
    setErr('')
    setBusy(true)
    await onJoinByCode(joinCode.trim())
    setBusy(false)
  }

  return (
    <div className="screen">
      <header className="hero">
        <div className="hero-eyebrow">GROUP ORDER, ONE TICKET</div>
        <h1 className="hero-title">GroupOrder</h1>
        <p className="hero-tagline">Order together. Eat together.</p>
      </header>

      <div className="tabs">
        <button
          className={`tab ${mode === 'create' ? 'tab--active' : ''}`}
          onClick={() => { setMode('create'); setErr('') }}
        >
          Start a session
        </button>
        <button
          className={`tab ${mode === 'join' ? 'tab--active' : ''}`}
          onClick={() => { setMode('join'); setErr('') }}
        >
          Join with a code
        </button>
      </div>

      {(err || loadError) && <div className="alert">{err || loadError}</div>}

      {mode === 'create' ? (
        <form className="card" onSubmit={handleCreate}>
          <label className="field">
            <span>Group name</span>
            <input
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              maxLength={80}
              autoFocus
            />
          </label>
          <label className="field">
            <span>Notes <em>(optional)</em></span>
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={140}
            />
          </label>
          <button className="btn btn--primary btn--block" type="submit" disabled={busy}>
            {busy ? 'Creating…' : 'Start session'}
          </button>
        </form>
      ) : (
        <form className="card" onSubmit={handleJoin}>
          <label className="field">
            <span>Session code</span>
            <input
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              maxLength={8}
              autoFocus
              style={{ letterSpacing: '0.2em', fontWeight: 700 }}
            />
          </label>
          <button className="btn btn--primary btn--block" type="submit">
            {busy ? 'Joining…' : 'Join session'}
          </button>
        </form>
      )}
    </div>
  )
}
