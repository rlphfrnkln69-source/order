export function peso(amount) {
  const n = Number(amount) || 0
  return '₱' + n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// Short, easy-to-say-out-loud session code, e.g. "7F2QK9"
export function generateSessionCode(length = 6) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no 0/O/1/I to avoid confusion
  let out = ''
  for (let i = 0; i < length; i++) {
    out += chars[Math.floor(Math.random() * chars.length)]
  }
  return out
}

export function generateToken() {
  return crypto.randomUUID()
}

export function getOrCreateClientToken() {
  let token = localStorage.getItem('go_client_token')
  if (!token) {
    token = generateToken()
    localStorage.setItem('go_client_token', token)
  }
  return token
}
