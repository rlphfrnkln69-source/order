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

// "3m ago", "just now", "2h ago" — for the organizer activity feed
export function timeAgo(dateString) {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000)
  if (seconds < 10) return 'just now'
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function formatDateTime(dateString) {
  return new Date(dateString).toLocaleString('en-PH', {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  })
}
