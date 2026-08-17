import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setErr('')
    setBusy(true)
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    setBusy(false)
    if (error) setErr('Invalid email or password.')
  }

  return (
    <div className="screen screen--center">
      <div className="hero" style={{ padding: '0 0 8px' }}>
        <div className="hero-eyebrow">STAFF ACCESS</div>
        <h1 className="hero-title" style={{ fontSize: 32 }}>GroupOrder Admin</h1>
      </div>
      <form className="card" style={{ width: '100%', maxWidth: 360 }} onSubmit={handleSubmit}>
        <label className="field">
          <span>Email</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
        </label>
        <label className="field">
          <span>Password</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        {err && <div className="alert">{err}</div>}
        <button className="btn btn--primary btn--block" type="submit" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}
